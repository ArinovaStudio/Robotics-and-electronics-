import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    
    if (!productId) {
      return NextResponse.json( { success: false, message: "Product ID is required" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "8");

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
      return NextResponse.json({ success: false, message: "Product not found--" }, { status: 404 });
    }

    const priceValue = (product.price as any)?.value || 0;
    const priceRange = priceValue * 0.3;

    const similarProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        categoryId: product.categoryId,
        isActive: true,
        category: { isActive: true },
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
        if (p.brand && p.brand === product.brand) score += 3;
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

    return NextResponse.json({ success: true, data: { products: formatted, total: formatted.length } }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}