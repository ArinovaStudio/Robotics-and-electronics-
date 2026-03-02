import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    if (!productId || typeof quantity !== "number") {
      return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
    }

    const [product, cart] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId, isActive: true },
        include: { category: { select: { isActive: true } } }
      }),
      prisma.cart.findUnique({ where: { userId: user.id } })
    ]);

    if (!product || !product.category?.isActive || product.availability === "OUT_OF_STOCK") {
      return NextResponse.json({ success: false, message: "This product is no longer available" }, { status: 404 });
    }

    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId }});

      return NextResponse.json({ success: true, message: "Item removed from cart" });
    }

    if (quantity > product.stockQuantity) {
      return NextResponse.json({ 
        success: false, 
        message: `Only ${product.stockQuantity} units available in stock`,
        availableStock: product.stockQuantity 
      }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
      update: { quantity: quantity },
      create: {
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
      },
    });

    return NextResponse.json({ success: true, message: "Cart updated successfully", data: cartItem });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
    }

    const { productId } = await request.json();

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });

    if (!cart){
        return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    return NextResponse.json({ success: true, message: "Item removed from cart" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}