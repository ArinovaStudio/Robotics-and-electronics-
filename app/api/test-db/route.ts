import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    const bestsellers = await prisma.product.findMany({
        where: { isActive: true, availability: "IN_STOCK" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { stockQuantity: "desc" },
        take: 6,
    });
    return NextResponse.json({ success: true, count: bestsellers.length, bestsellers });
  } catch (error: any) {
    return NextResponse.json({ success: false, errorMessage: error.message, errorStack: error.stack });
  }
}
