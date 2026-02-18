import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Fetch category by slug
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return notFoundResponse("Category not found");
    }

    return successResponse(category);
  } catch (error) {
    console.error("Get category error:", error);
    return errorResponse("Internal server error", 500);
  }
}
