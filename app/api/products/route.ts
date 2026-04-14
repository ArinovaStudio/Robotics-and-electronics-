import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 12);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const type = searchParams.get("type") || "all"; // "all", "on_sale", "trending"

    const where: any = { isActive: true, category: { isActive: true } };

    if (categoryId && categoryId !== "null") {
      async function getAllChildIds(id: string): Promise<string[]> {
        const children = await prisma.category.findMany({
          where: { parentId: id, isActive: true },
          select: { id: true },
        });
        const childIds = children.map((c) => c.id);
        const nestedIds = await Promise.all(childIds.map((cid) => getAllChildIds(cid)));
        return [id, ...childIds, ...nestedIds.flat()];
      }

      const rootIds = categoryId.split(",").map((id) => id.trim()).filter(Boolean);
      const allTargetIds = (await Promise.all(rootIds.map(getAllChildIds))).flat();

      where.categoryId = { in: allTargetIds };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        // { description: { contains: search, mode: "insensitive" } },
        // { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice !== null) priceFilter.gte = minPrice;
      if (maxPrice !== null) priceFilter.lte = maxPrice;
      
      where.AND = [
        { OR: [ { AND: [
                 { salePrice: { not: null } },
                 { salePrice: priceFilter } ] },
                { AND: [
                 { salePrice: null },
                 { price: priceFilter } ] }
        ]}];
    }

    if (brand) {
      const brandList = brand.split(",").map((b) => b.trim());
      where.brand = { in: brandList, mode: "insensitive" };
    }

    if (type === "on_sale") {
      where.salePrice = { not: null };
    } else if (type === "trending") {
      where.OR = [
        { customLabel0: { contains: "trending", mode: "insensitive" } },
        { customLabel1: { contains: "trending", mode: "insensitive" } }
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "price_asc": orderBy = { price: "asc" }; break;
      case "price_desc": orderBy = { price: "desc" }; break;
      case "popular": orderBy = { stockQuantity: "desc" }; break;
      case "title_asc": orderBy = { title: "asc" }; break;
      default: orderBy = { createdAt: "desc" };
    }

    const [products, totalItems, filterStats] = await Promise.all([
      
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        }, skip, take: limit, orderBy,
      }),

      prisma.product.count({ where }),

      prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      message: "Products fetched successfully",
      data: {
        products: products.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          image: p.imageLink,
          price: Number(p.price).toFixed(2),
          salePrice: p.salePrice ? Number(p.salePrice).toFixed(2) : null,
          availability: p.availability,
          brand: p.brand,
          category: p.category,
          stock: p.stockQuantity,
          isLowStock: p.stockQuantity > 0 && p.stockQuantity < 5,
          link: p.link
        })),
        facets: {
          categories: filterStats
            .filter((c) => c._count.products > 0)
            .map((c) => ({
              id: c.id,
              name: c.name,
              count: c._count.products,
            })),
          brands: [...new Set(products.map((p) => p.brand).filter(Boolean))],
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
        },
      },
    });
  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 } );
  }
}