import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import {
  adminListProductsQuerySchema,
  createProductSchema,
} from "@/app/lib/validations/admin-product";

// GET /api/admin/products - List all products for admin
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());

    const validation = adminListProductsQuerySchema.safeParse(queryObject);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { page, limit, search, category, availability, isActive, sort } =
      validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      const categoryRecord = await prisma.category.findFirst({
        where: { slug: category },
        select: { id: true },
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      } else {
        // Return empty result if category not found
        return successResponse({
          products: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }
    }

    if (availability) {
      where.availability = availability;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "title_asc":
        orderBy = { title: "asc" };
        break;
      case "stock_asc":
        orderBy = { stockQuantity: "asc" };
        break;
      case "stock_desc":
        orderBy = { stockQuantity: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error: any) {
    return (
      error.response ||
      new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500 },
      )
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const data = validation.data;

    // Parallel validation checks
    const [category, existingProduct] = await Promise.all([
      prisma.category.findUnique({
        where: { id: data.categoryId },
        select: { id: true },
      }),
      prisma.product.findFirst({
        where: {
          OR: [{ link: data.link }, { sku: data.sku }],
        },
        select: { link: true, sku: true },
      }),
    ]);

    if (!category) {
      return errorResponse("Category not found", 404);
    }

    if (existingProduct) {
      if (existingProduct.link === data.link) {
        return errorResponse("Product with this link/slug already exists", 400);
      }
      if (existingProduct.sku === data.sku) {
        return errorResponse("Product with this SKU already exists", 400);
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        link: data.link,
        imageLink: data.imageLink,
        additionalImageLinks: data.additionalImageLinks,
        price: data.price,
        salePrice: data.salePrice || undefined,
        salePriceEffectiveDate: data.salePriceEffectiveDate || undefined,
        availability: data.availability,
        stockQuantity: data.stockQuantity,
        sku: data.sku,
        mpn: data.mpn || null,
        brand: data.brand || null,
        condition: data.condition,
        categoryId: data.categoryId,
        productDetails: data.productDetails,
        productHighlights: data.productHighlights,
        customLabel0: data.customLabel0 || null,
        customLabel1: data.customLabel1 || null,
        isActive: data.isActive,
        isBundle: data.isBundle,
      },
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

    return new Response(
      JSON.stringify({
        success: true,
        message: "Product created successfully.",
        data: product,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    return (
      error.response ||
      new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500 },
      )
    );
  }
}
