import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { categoryProductsQuerySchema } from "@/app/lib/validations/category";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!category) {
      return notFoundResponse("Category not found");
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryValidation = categoryProductsQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      brand: searchParams.get("brand") ?? undefined,
      availability: searchParams.get("availability") ?? undefined,
      condition: searchParams.get("condition") ?? undefined,
    });

    if (!queryValidation.success) {
      return errorResponse("Invalid query parameters", 400);
    }

    const {
      page,
      limit,
      sort,
      minPrice,
      maxPrice,
      brand,
      availability,
      condition,
    } = queryValidation.data;

    // Build where clause
    const where: any = {
      categoryId: category.id,
      isActive: true,
    };

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

    // Fetch products to filter by price (since price is stored as JSON)
    const allProducts = await prisma.product.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        link: true,
        imageLink: true,
        price: true,
        salePrice: true,
        availability: true,
        brand: true,
        stockQuantity: true,
        createdAt: true,
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
        // For now, sort by stock quantity as a proxy for popularity
        filteredProducts.sort(
          (a: any, b: any) => b.stockQuantity - a.stockQuantity,
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

    // Calculate filters (from all products in category)
    const allCategoryProducts = await prisma.product.findMany({
      where: { categoryId: category.id, isActive: true },
      select: {
        price: true,
        brand: true,
        availability: true,
      },
    });

    // Extract unique brands
    const brands = [
      ...new Set(
        allCategoryProducts
          .map((p: any) => p.brand)
          .filter((b: any) => b !== null),
      ),
    ];

    // Extract unique availability statuses
    const availabilities = [
      ...new Set(allCategoryProducts.map((p: any) => p.availability)),
    ];

    // Calculate price range
    const prices = allCategoryProducts
      .map((p: any) => p.price?.value || 0)
      .filter((price: number) => price > 0);
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };

    // Prepare response
    const response = {
      category,
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
      filters: {
        priceRange,
        brands,
        availability: availabilities,
      },
    };

    return successResponse(response);
  } catch (error) {
    console.error("Get category products error:", error);
    return errorResponse("Internal server error", 500);
  }
}
