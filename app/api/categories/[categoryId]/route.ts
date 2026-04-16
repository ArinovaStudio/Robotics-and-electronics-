import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const { categoryId } = await params;

    if (!categoryId || categoryId === "null" || categoryId === "undefined" || categoryId.trim() === "") {
      return NextResponse.json( { success: false, message: "Invalid Product ID" }, { status: 400 });
    }

    const cleanId = decodeURIComponent(categoryId).replace(/^\/+/, '').trim();

    const category = await prisma.category.findFirst({
      where: { 
        OR: [
          { id: cleanId },
          { slug: cleanId }
        ],
        isActive: true 
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          }
        },
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
    });

    if (!category) {
      return NextResponse.json( { success: false, message: "Category not found or unavailable" }, { status: 404 } );
    }

    return NextResponse.json({ success: true, data: { category } }, { status: 200 });

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 } );
  }
}