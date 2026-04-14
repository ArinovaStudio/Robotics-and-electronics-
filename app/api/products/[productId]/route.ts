import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET( req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    
    if (!productId) {
      return NextResponse.json( { success: false, message: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { 
        OR: [
          { id: productId },
          { link: productId }
        ],
        isActive: true,
        category: { isActive: true }
      },
      include: {
        category: { select: { id: true, name: true, slug: true }},
        reviews: { select: { rating: true } }
      }
    });

    if (!product) {
      return NextResponse.json( { success: false, message: "Product not found" }, { status: 404 });
    }

    const reviewCount = product.reviews.length;
    const avgRating = reviewCount > 0 
      ? product.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / reviewCount 
      : 0;

    return NextResponse.json({ success: true, data: { product: { ...product, avgRating } } }, { status: 200 });

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}