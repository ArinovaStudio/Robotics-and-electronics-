import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "8");

    if (!productId) {
      return errorResponse("Product ID is required", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        categoryId: true,
        brand: true,
        price: true,
      },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const priceValue = (product.price as any)?.value || 0;
    const priceRange = priceValue * 0.3;

    const similarProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        categoryId: product.categoryId,
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      take: limit * 2,
      orderBy: { createdAt: "desc" },
    });

    const scored = similarProducts
      .map((p) => {
        let score = 0;
        if (p.brand === product.brand) score += 3;
        const pPrice = (p.price as any)?.value || 0;
        if (Math.abs(pPrice - priceValue) <= priceRange) score += 2;
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const formatted = scored.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      link: p.link,
      imageLink: p.imageLink,
      price: p.price,
      salePrice: p.salePrice,
      availability: p.availability,
      brand: p.brand,
      category: p.category,
      stockQuantity: p.stockQuantity,
    }));

    return successResponse({ products: formatted, total: formatted.length });
  } catch (error) {
    console.error("Similar products error:", error);
    return errorResponse("Internal server error", 500);
  }
}
