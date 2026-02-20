import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { uploadFile } from "@/app/lib/upload";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/app/lib/api-response";
import { createCategorySchema } from "@/app/lib/validations/admin-category";

// GET /api/admin/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return successResponse({ categories });
  } catch (error: any) {
    return (
      error.response ||
      new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500 },
      )
    );
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const contentType = request.headers.get("content-type") || "";

    // Handle JSON request
    if (contentType.includes("application/json")) {
      const body = await request.json();

      const validation = createCategorySchema.safeParse(body);
      if (!validation.success) {
        return errorResponse(validation.error.issues[0].message, 400);
      }

      const data = validation.data;

      // Check if slug is unique
      const existingBySlug = await prisma.category.findUnique({
        where: { slug: data.slug },
      });
      if (existingBySlug) {
        return errorResponse("Category with this slug already exists", 400);
      }

      // If parentId provided, validate parent exists
      if (data.parentId) {
        const parent = await prisma.category.findUnique({
          where: { id: data.parentId },
        });
        if (!parent) {
          return errorResponse("Parent category not found", 404);
        }
      }

      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          image: data.image || null,
          parentId: data.parentId || null,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Category created successfully.",
          data: category,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    }

    // Handle FormData request (for image uploads)
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const parentId = formData.get("parentId") as string | null;
    const isActive = formData.get("isActive") !== "false";
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");
    const imageFile = formData.get("image") as File | null;

    if (!name) {
      return errorResponse("Category name is required", 400);
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const existingCategory = await prisma.category.findFirst({
      where: { OR: [{ slug }, { name }] },
    });
    if (existingCategory) {
      return errorResponse(
        "Category with this name or slug already exists",
        400,
      );
    }

    // image upload
    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadFile(imageFile, "categories");
      } catch {
        return errorResponse("Failed to upload image", 400);
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        isActive,
        sortOrder,
        parentId: parentId && parentId !== "null" ? parentId : null,
        image: imageUrl,
      },
    });

    return successResponse(category, "Category created successfully", 201);
  } catch (error: any) {
    if (
      error.message.includes("Admin access required") ||
      error.message === "Unauthorized"
    ) {
      return unauthorizedResponse(error.message);
    }
    return errorResponse("Internal server error", 500);
  }
}
