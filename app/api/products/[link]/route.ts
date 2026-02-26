import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ link: string }> },
) {
  try {
    const { link } = await params;

    // Fetch product by link
    const product = await prisma.product.findUnique({
      where: { link },
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

    if (!product) {
      return notFoundResponse("Product not found");
    }

    // Fetch related products (same category, exclude current product)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: product.id },
      },
      select: {
        id: true,
        title: true,
        description: true,
        link: true,
        imageLink: true,
        price: true,
        salePrice: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Format response with all product details
    const formattedProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      link: product.link,

      imageLink: product.imageLink,
      additionalImageLinks: product.additionalImageLinks,

      price: product.price,
      salePrice: product.salePrice,
      salePriceEffectiveDate: product.salePriceEffectiveDate,

      availability: product.availability,
      stockQuantity: product.stockQuantity,

      sku: product.sku,
      mpn: product.mpn,
      brand: product.brand,
      condition: product.condition,

      category: product.category,

      productDetails: product.productDetails,
      productHighlights: product.productHighlights,

      isActive: product.isActive,
      isBundle: product.isBundle,

      customLabel0: product.customLabel0,
      customLabel1: product.customLabel1,

      relatedProducts: relatedProducts,

      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return successResponse(formattedProduct);
  } catch (error) {
    console.error("Get product error:", error);
    return errorResponse("Internal server error", 500);
  }
}
