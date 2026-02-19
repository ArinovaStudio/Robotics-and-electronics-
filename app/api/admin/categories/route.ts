import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { uploadFile } from "@/app/lib/upload";
import { successResponse, errorResponse, unauthorizedResponse } from "@/app/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
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

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    const existingCategory = await prisma.category.findFirst({ where: { OR: [{ slug }, { name }] } });
    if (existingCategory) {
      return errorResponse("Category with this name or slug already exists", 400);
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
    if (error.message.includes("Admin access required") || error.message === "Unauthorized") {
      return unauthorizedResponse(error.message);
    }
    return errorResponse("Internal server error", 500);
  }
}