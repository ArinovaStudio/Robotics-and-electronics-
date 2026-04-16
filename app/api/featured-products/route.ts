import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: {
        featured: true,
      },
    });
    return NextResponse.json({ success: true, products: featuredProducts });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Internal Server Error!",
    });
  }
}
