import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { listCategoriesQuerySchema } from "@/app/lib/validations/category";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const queryValidation = listCategoriesQuerySchema.safeParse({
      includeProducts: searchParams.get("includeProducts") ?? undefined,
      includeChildren: searchParams.get("includeChildren") ?? undefined,
      parentId: searchParams.get("parentId") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
    });

    if (!queryValidation.success) {
      return errorResponse("Invalid query parameters", 400);
    }

    const { includeProducts, includeChildren, parentId, isActive } =
      queryValidation.data;

    // Build where clause
    const where: any = {};

    // Filter by parentId
    if (parentId !== undefined) {
      where.parentId = parentId === "null" ? null : parentId;
    }

    // Filter by isActive
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Build include clause
    const include: any = {};

    if (includeProducts) {
      include._count = {
        select: { products: true },
      };
    }

    if (includeChildren) {
      include.children = {
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
          isActive: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      };
    }

    // Fetch categories
    const hasInclude = Object.keys(include).length > 0;
    const categories = await prisma.category.findMany({
      where,
      ...(hasInclude && { include }),
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(categories);
  } catch (error) {
    console.error("List categories error:", error);
    return errorResponse("Internal server error", 500);
  }
}
