import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });

    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    } 

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return NextResponse.json({ success: true, message: "Cart cleared successfully" }, { status: 200 });
    
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}