import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { listProductsQuerySchema } from "@/app/lib/validations/product";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const queryValidation = listProductsQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      category: searchParams.get("category"),
      sort: searchParams.get("sort"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      brand: searchParams.get("brand"),
      availability: searchParams.get("availability"),
      condition: searchParams.get("condition"),
      customLabel0: searchParams.get("customLabel0"),
      customLabel1: searchParams.get("customLabel1"),
    });

    if (!queryValidation.success) {
      return errorResponse("Invalid query parameters", 400);
    }

    const {
      page,
      limit,
      search,
      category,
      sort,
      minPrice,
      maxPrice,
      brand,
      availability,
      condition,
      customLabel0,
      customLabel1,
    } = queryValidation.data;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    // Filter by category slug
    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      });

      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      } else {
        // Return empty result if category doesn't exist
        return successResponse({
          products: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
          },
        });
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

    // Filter by custom labels
    if (customLabel0) {
      where.customLabel0 = customLabel0;
    }

    if (customLabel1) {
      where.customLabel1 = customLabel1;
    }

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { mpn: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch products with category info
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
      orderBy: { createdAt: "desc" },
    });

    // Filter by price range (since price is JSON field)
    let filteredProducts = allProducts.filter((product: any) => {
      const priceValue = product.price?.value || 0;
      if (minPrice !== undefined && priceValue < minPrice) return false;
      if (maxPrice !== undefined && priceValue > maxPrice) return false;
      return true;
    });

    // Sort products
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
      case "popular":
        // Sort by stock quantity as a proxy for popularity
        filteredProducts.sort(
          (a: any, b: any) => b.stockQuantity - a.stockQuantity,
        );
        break;
      case "title_asc":
        filteredProducts.sort((a: any, b: any) =>
          a.title.localeCompare(b.title),
        );
        break;
      default:
        break;
    }

    // Calculate pagination
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(skip, skip + limit);

    // Format products for response
    const formattedProducts = paginatedProducts.map((product: any) => ({
      id: product.id,
      title: product.title,
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
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("List products error:", error);
    return errorResponse("Internal server error", 500);
  }
}
