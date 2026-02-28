import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";

async function resolveUserId(authUser: { id: string; email?: string | null }): Promise<string> {
  const userById = await prisma.user.findUnique({ where: { id: authUser.id }, select: { id: true } });
  if (userById) return userById.id;
  if (authUser.email) {
    const userByEmail = await prisma.user.findUnique({ where: { email: authUser.email }, select: { id: true } });
    if (userByEmail) return userByEmail.id;
  }
  throw new Error("User not found in database");
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const userId = await resolveUserId(user);

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
