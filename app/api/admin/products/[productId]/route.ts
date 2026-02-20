import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { updateProductSchema } from "@/app/lib/validations/admin-product";

// PATCH /api/admin/products/[productId] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } },
) {
  try {
    await requireAdmin();

    const { productId } = params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const body = await request.json();

    const validation = updateProductSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const data = validation.data;

    // Build validation queries array
    const validationPromises: Promise<any>[] = [];
    let checkCategory = false;
    let checkUniqueness = false;
    const uniquenessConditions: any[] = [];

    if (data.categoryId) {
      checkCategory = true;
      validationPromises.push(
        prisma.category.findUnique({
          where: { id: data.categoryId },
          select: { id: true },
        }),
      );
    }

    if (data.link && data.link !== product.link) {
      checkUniqueness = true;
      uniquenessConditions.push({ link: data.link });
    }

    if (data.sku && data.sku !== product.sku) {
      checkUniqueness = true;
      uniquenessConditions.push({ sku: data.sku });
    }

    if (checkUniqueness) {
      validationPromises.push(
        prisma.product.findFirst({
          where: {
            OR: uniquenessConditions,
            NOT: { id: productId },
          },
          select: { link: true, sku: true },
        }),
      );
    }

    // Execute all validation queries in parallel
    if (validationPromises.length > 0) {
      const results = await Promise.all(validationPromises);
      let resultIndex = 0;

      if (checkCategory) {
        const category = results[resultIndex++];
        if (!category) {
          return errorResponse("Category not found", 404);
        }
      }

      if (checkUniqueness) {
        const existingProduct = results[resultIndex];
        if (existingProduct) {
          if (data.link && existingProduct.link === data.link) {
            return errorResponse(
              "Product with this link/slug already exists",
              400,
            );
          }
          if (data.sku && existingProduct.sku === data.sku) {
            return errorResponse("Product with this SKU already exists", 400);
          }
        }
      }
    }

    // Build update data object (only include provided fields)
    const updateData: any = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return successResponse(updatedProduct, "Product updated successfully.");
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

// DELETE /api/admin/products/[productId] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } },
) {
  try {
    await requireAdmin();

    const { productId } = params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return errorResponse("Product not found", 404);
    }

    // Check if product has pending/processing orders
    const pendingOrders = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          status: {
            in: ["PENDING", "CONFIRMED", "PROCESSING"],
          },
        },
      },
    });

    if (pendingOrders) {
      return errorResponse(
        "Cannot delete product with pending orders. Please mark as inactive instead.",
        400,
      );
    }

    // Soft delete - just mark as inactive
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    // Note: Not deleting images from filesystem in this implementation
    // In production, you would want to handle image cleanup here

    return successResponse(null, "Product deleted successfully.");
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
