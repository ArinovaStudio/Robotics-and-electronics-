import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET( req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    
    if (!productId) {
      return NextResponse.json( { success: false, message: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { 
        id: productId,
        isActive: true,
        category: { isActive: true }
      },
      include: {
        category: { select: { id: true, name: true, slug: true }}
      }
    });

    if (!product) {
      return NextResponse.json( { success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { product } }, { status: 200 });

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}