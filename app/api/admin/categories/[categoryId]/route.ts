import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/upload";
import { getAdminUser } from "@/lib/auth";

export async function GET( request: NextRequest, { params }: { params: Promise<{ categoryId: string }> } ) {
  try {
    const { categoryId } = await params;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category){
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    };

    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT( request: NextRequest, { params }: { params: Promise<{ categoryId: string }> } ) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { categoryId } = await params;

    const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!existingCategory) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const parentId = formData.get("parentId") as string | null;
    const isActive = formData.get("isActive") as string | null;
    const sortOrderRaw = formData.get("sortOrder");
    const imageFile = formData.get("image") as File | null;

    const updateData: any = {};

    if (sortOrderRaw !== null) {
      if (sortOrderRaw === "" || sortOrderRaw === "null") {
        updateData.sortOrder = null; 
      } else {
        const parsedSortOrder = parseInt(sortOrderRaw as string);
        
        if (isNaN(parsedSortOrder) || parsedSortOrder < 1) {
          return NextResponse.json({ success: false, message: "Sort order must be 1 or greater" }, { status: 400 });
        }

        const duplicateSortOrder = await prisma.category.findFirst({
          where: {
            sortOrder: parsedSortOrder,
            id: { not: categoryId },
          },
        });

        if (duplicateSortOrder) {
          return NextResponse.json({ success: false, message: `Sort order ${parsedSortOrder} is already in use` }, { status: 400 });
        }
        updateData.sortOrder = parsedSortOrder;
      }
    }

    if (name && name !== existingCategory.name) {
      const duplicateName = await prisma.category.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          id: { not: categoryId },
        },
      });

      if (duplicateName) {
        return NextResponse.json({ success: false, message: "Category name already exists" }, { status: 400 });
      }

      updateData.name = name;

      let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

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

    if (parentId !== null) {
      const newParentId = parentId === "null" || parentId.trim() === "" ? null : parentId;

      if (newParentId) {
        if (newParentId === existingCategory.id) {
          return NextResponse.json({ success: false, message: "Cannot set a category as its own parent" }, { status: 400 });
        }

        const parentCategory = await prisma.category.findUnique({
          where: { id: newParentId },
        });
        if (!parentCategory) {
          return NextResponse.json({ success: false, message: "Selected parent category does not exist"}, { status: 400 });
        }

        if (parentCategory.parentId === existingCategory.id) {
          return NextResponse.json({ success: false, message: "Cannot set parent to a sub-category of itself (circular reference)",}, { status: 400 });
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
            console.warn("Failed to delete old image");
          }
        }
      } catch {
        return NextResponse.json({ success: false, message: "Failed to upload image" }, { status: 500 });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: "Category updated successfully", data: updatedCategory }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
 

export async function DELETE( request: NextRequest, { params }: { params: Promise<{ categoryId: string }> } ) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { categoryId } = await params;

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    if ( existingCategory._count.products > 0 || existingCategory._count.children > 0 ) {
      return NextResponse.json({ success: false, message: "Category has products or sub-categories" }, { status: 400 });
    }

    if (existingCategory.image) {
      await deleteFile(existingCategory.image);
    }

    await prisma.category.delete({ where: { id: categoryId } });

    return NextResponse.json({ success: true, message: "Category deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
