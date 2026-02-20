import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { uploadFile, deleteFile } from "@/app/lib/upload";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/app/lib/api-response";
import { updateCategorySchema } from "@/app/lib/validations/admin-category";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    await requireAdmin();
    const { categoryId } = await params;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) return notFoundResponse("Category not found");

    return successResponse(category);
  } catch (error: any) {
    if (error.message.includes("Admin access required"))
      return unauthorizedResponse(error.message);
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    await requireAdmin();
    const { categoryId } = await params;

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return notFoundResponse("Category not found");
    }

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const parentId = formData.get("parentId") as string | null;
    const isActive = formData.get("isActive") as string | null;
    const sortOrder = formData.get("sortOrder") as string | null;
    const imageFile = formData.get("image") as File | null;

    const updateData: any = {};

    if (name && name !== existingCategory.name) {
      const duplicateName = await prisma.category.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          id: { not: categoryId },
        },
      });

      if (duplicateName) {
        return errorResponse(
          `Category with name "${name}" already exists`,
          400,
        );
      }

      updateData.name = name;

      let slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const existingSlug = await prisma.category.findUnique({
        where: { slug },
      });
      if (existingSlug && existingSlug.id !== categoryId) {
        slug = `${slug}-${Date.now()}`;
      }
      updateData.slug = slug;
    }

    if (description !== null) updateData.description = description;
    if (isActive !== null) updateData.isActive = isActive === "true";
    if (sortOrder !== null) updateData.sortOrder = parseInt(sortOrder);

    if (parentId !== null) {
      const newParentId =
        parentId === "null" || parentId.trim() === "" ? null : parentId;

      if (newParentId) {
        if (newParentId === existingCategory.id) {
          return errorResponse("Cannot set a category as its own parent", 400);
        }

        const parentCategory = await prisma.category.findUnique({
          where: { id: newParentId },
        });
        if (!parentCategory) {
          return errorResponse("Selected parent category does not exist", 400);
        }

        if (parentCategory.parentId === existingCategory.id) {
          return errorResponse(
            "Cannot set parent to a sub-category of itself (circular reference)",
            400,
          );
        }
      }

      updateData.parentId = newParentId;
    }

    if (imageFile && imageFile.size > 0) {
      try {
        const imageUrl = await uploadFile(imageFile, "categories");
        updateData.image = imageUrl;

        if (existingCategory.image) {
          try {
            await deleteFile(existingCategory.image);
          } catch {
            console.warn(
              "Non-fatal error: Could not delete old image from disk",
            );
          }
        }
      } catch {
        return errorResponse("Failed to upload image", 400);
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return successResponse(updatedCategory, "Category updated successfully");
  } catch (error: any) {
    console.error("Update category error:", error);
    if (error.message.includes("Admin access required"))
      return unauthorizedResponse(error.message);
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/admin/categories/[categoryId] - Update category (JSON)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    await requireAdmin();
    const { categoryId } = await params;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return notFoundResponse("Category not found");
    }

    const body = await request.json();

    const validation = updateCategorySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const data = validation.data;

    // Build validation queries
    const validationPromises: Promise<any>[] = [];
    let checkSlug = false;
    let checkParent = false;

    // If updating slug, check uniqueness
    if (data.slug && data.slug !== category.slug) {
      checkSlug = true;
      validationPromises.push(
        prisma.category.findFirst({
          where: {
            slug: data.slug,
            NOT: { id: categoryId },
          },
          select: { id: true },
        }),
      );
    }

    // If updating parentId, validate parent exists and no circular reference
    if (data.parentId !== undefined && data.parentId !== category.parentId) {
      if (data.parentId) {
        // Cannot set self as parent
        if (data.parentId === categoryId) {
          return errorResponse("Cannot set a category as its own parent", 400);
        }

        checkParent = true;
        validationPromises.push(
          prisma.category.findUnique({
            where: { id: data.parentId },
            select: { id: true, parentId: true },
          }),
        );
      }
    }

    // Execute validation queries in parallel
    if (validationPromises.length > 0) {
      const results = await Promise.all(validationPromises);
      let resultIndex = 0;

      if (checkSlug) {
        const existingSlug = results[resultIndex++];
        if (existingSlug) {
          return errorResponse("Category with this slug already exists", 400);
        }
      }

      if (checkParent) {
        const parentCategory = results[resultIndex];
        if (!parentCategory) {
          return errorResponse("Parent category not found", 404);
        }
        // Check for circular reference
        if (parentCategory.parentId === categoryId) {
          return errorResponse(
            "Cannot set parent to a sub-category of itself (circular reference)",
            400,
          );
        }
      }
    }

    // Build update data
    const updateData: any = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
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

    return successResponse(updatedCategory, "Category updated successfully.");
  } catch (error: any) {
    return (
      error.response ||
      new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        {
          status: 500,
        },
      )
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    await requireAdmin();
    const { categoryId } = await params;

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!existingCategory) {
      return notFoundResponse("Category not found");
    }

    if (
      existingCategory._count.products > 0 ||
      existingCategory._count.children > 0
    ) {
      return errorResponse(
        "Cannot delete category because it contains products or sub-categories.",
        400,
      );
    }

    if (existingCategory.image) {
      await deleteFile(existingCategory.image);
    }

    await prisma.category.delete({ where: { id: categoryId } });

    return successResponse(null, "Category deleted successfully");
  } catch (error: any) {
    if (error.message.includes("Admin access required"))
      return unauthorizedResponse(error.message);
    return errorResponse("Internal server error", 500);
  }
}
