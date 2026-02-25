import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";
import { updateCartItemSchema } from "@/app/lib/validations/cart";

async function resolveUserId(authUser: { id: string; email?: string | null }): Promise<string> {
  const userById = await prisma.user.findUnique({ where: { id: authUser.id }, select: { id: true } });
  if (userById) return userById.id;
  if (authUser.email) {
    const userByEmail = await prisma.user.findUnique({ where: { email: authUser.email }, select: { id: true } });
    if (userByEmail) return userByEmail.id;
  }
  throw new Error("User not found in database");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const user = await requireAuth();
    const userId = await resolveUserId(user);

    const { itemId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validation = updateCartItemSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0]?.message || "Invalid request data",
        400,
      );
    }

    const { quantity } = validation.data;

    // Find cart item and verify it belongs to user's cart
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: {
          select: {
            userId: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            stockQuantity: true,
            availability: true,
            isActive: true,
            price: true,
            salePrice: true,
          },
        },
      },
    });

    if (!cartItem) {
      return notFoundResponse("Cart item not found");
    }

    // Verify cart belongs to user
    if (cartItem.cart.userId !== userId) {
      return errorResponse("Unauthorized", 403);
    }

    // Validate product is still available
    if (!cartItem.product.isActive) {
      return errorResponse("Product is no longer available", 400);
    }

    if (cartItem.product.availability !== "IN_STOCK") {
      return errorResponse("Product is out of stock", 400);
    }

    // Validate new quantity <= stock
    if (quantity > cartItem.product.stockQuantity) {
      return errorResponse(
        `Only ${cartItem.product.stockQuantity} items available in stock`,
        400,
      );
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    // Calculate cart summary
    const allCartItems = await prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
      include: {
        product: {
          select: {
            price: true,
            salePrice: true,
          },
        },
      },
    });

    let totalItems = 0;
    let subtotal = 0;

    allCartItems.forEach((item) => {
      const price = (item.product.price as any).value;
      const salePrice = item.product.salePrice
        ? (item.product.salePrice as any).value
        : null;
      const effectivePrice = salePrice || price;

      totalItems += item.quantity;
      subtotal += effectivePrice * item.quantity;
    });

    return successResponse(
      {
        cartItem: {
          id: updatedCartItem.id,
          productId: updatedCartItem.productId,
          quantity: updatedCartItem.quantity,
        },
        cartSummary: {
          totalItems,
          subtotal,
        },
      },
      "Cart item updated",
    );
  } catch (error) {
    console.error("Update cart item error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const user = await requireAuth();
    const userId = await resolveUserId(user);

    const { itemId } = await params;

    // Find cart item and verify it belongs to user's cart
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!cartItem) {
      return notFoundResponse("Cart item not found");
    }

    // Verify cart belongs to user
    if (cartItem.cart.userId !== userId) {
      return errorResponse("Unauthorized", 403);
    }

    // Store cartId before deletion
    const cartId = cartItem.cartId;

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Calculate cart summary
    const allCartItems = await prisma.cartItem.findMany({
      where: { cartId },
      include: {
        product: {
          select: {
            price: true,
            salePrice: true,
          },
        },
      },
    });

    let totalItems = 0;
    let subtotal = 0;

    allCartItems.forEach((item) => {
      const price = (item.product.price as any).value;
      const salePrice = item.product.salePrice
        ? (item.product.salePrice as any).value
        : null;
      const effectivePrice = salePrice || price;

      totalItems += item.quantity;
      subtotal += effectivePrice * item.quantity;
    });

    return successResponse(
      {
        cartSummary: {
          totalItems,
          subtotal,
        },
      },
      "Item removed from cart",
    );
  } catch (error) {
    console.error("Remove cart item error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Internal server error", 500);
  }
}
