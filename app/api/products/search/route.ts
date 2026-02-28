import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q");
    if (!q) {
      return errorResponse("Search query 'q' is required", 400);
    }

    // Parse pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    // Parse filters
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;
    const brand = searchParams.get("brand");
    const availability = searchParams.get("availability");
    const condition = searchParams.get("condition");
    const sort = searchParams.get("sort") || "relevance";

    // Build where clause
    const where: any = {
      isActive: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { mpn: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
      ],
    };

    // Filter by category slug
    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      });

      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }

    // Filter by availability
    if (availability) {
      where.availability = availability;
    }

    // Filter by condition
    if (condition) {
      where.condition = condition;
    }

    // Filter by brand (support comma-separated values)
    if (brand) {
      const brands = brand.split(",").map((b) => b.trim());
      where.brand = { in: brands };
    }

    // Fetch products
    const allProducts = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Filter by price range (since price is JSON field)
    let filteredProducts = allProducts.filter((product: any) => {
      const priceValue = product.price?.value || 0;
      if (minPrice !== undefined && priceValue < minPrice) return false;
      if (maxPrice !== undefined && priceValue > maxPrice) return false;
      return true;
    });

    // Sort products
    if (sort === "relevance") {
      // Sort by relevance: prioritize title matches, then by newest
      filteredProducts.sort((a: any, b: any) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const query = q.toLowerCase();

        const aStartsWith = aTitle.startsWith(query);
        const bStartsWith = bTitle.startsWith(query);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        const aIncludes = aTitle.includes(query);
        const bIncludes = bTitle.includes(query);

        if (aIncludes && !bIncludes) return -1;
        if (!aIncludes && bIncludes) return 1;

        // If both have same relevance, sort by newest
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } else {
      // Apply other sorting options
      switch (sort) {
        case "price_asc":
          filteredProducts.sort((a: any, b: any) => {
            const priceA = a.salePrice?.value || a.price?.value || 0;
            const priceB = b.salePrice?.value || b.price?.value || 0;
            return priceA - priceB;
          });
          break;
        case "price_desc":
          filteredProducts.sort((a: any, b: any) => {
            const priceA = a.salePrice?.value || a.price?.value || 0;
            const priceB = b.salePrice?.value || b.price?.value || 0;
            return priceB - priceA;
          });
          break;
        case "newest":
          filteredProducts.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;
        case "title_asc":
          filteredProducts.sort((a: any, b: any) =>
            a.title.localeCompare(b.title),
          );
          break;
      }
    }

    // Generate search suggestions (find similar products)
    const suggestions = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { title: true },
      take: 5,
      distinct: ["title"],
    });

    const suggestionList = suggestions.map((s) => s.title);

    // Calculate pagination
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(skip, skip + limit);

    // Format products
    const formattedProducts = paginatedProducts.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      link: product.link,
      imageLink: product.imageLink,
      price: product.price,
      salePrice: product.salePrice,
      availability: product.availability,
      brand: product.brand,
      condition: product.condition,
      category: product.category,
      productHighlights: product.productHighlights,
      stockQuantity: product.stockQuantity,
    }));

    return successResponse({
      query: q,
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
      suggestions: suggestionList,
    });
  } catch (error) {
    console.error("Search products error:", error);
    return errorResponse("Internal server error", 500);
  }
}
