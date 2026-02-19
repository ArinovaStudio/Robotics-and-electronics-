import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();
    const userId = user.id;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    // If cart exists, delete all items
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return successResponse(null, "Cart cleared");
  } catch (error) {
    console.error("Clear cart error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Internal server error", 500);
  }
}
