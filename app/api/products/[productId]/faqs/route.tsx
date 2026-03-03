import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET( req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;

    const faqs = await prisma.productFaq.findMany({
      where: { productId },
      orderBy: { order: "asc" }
    });

    return NextResponse.json({ success: true, data: faqs }, { status: 200 });
  } catch  {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}