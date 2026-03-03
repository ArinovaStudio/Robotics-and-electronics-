import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let cart: any = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: { include: { 
          product: { 
            select: {
                id: true,
                title: true,
                imageLink: true,
                price: true,
                salePrice: true,
                stockQuantity: true,
                availability: true,
                isActive: true,
                category: { select: { isActive: true } },
                reviews: { select: { rating: true } }
              },
           }
         } },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: { items: { include: { product: true } } }
      });
    }

    const itemsToRemove: string[] = [];
    const validItems = [];
    let wasAdjusted = false;

    for (const item of cart.items) {
      const p = item.product;
      
      const isInvalid = !p.isActive || !p.category.isActive || p.stockQuantity <= 0 || p.availability === "OUT_OF_STOCK";

      if (isInvalid) {
        itemsToRemove.push(item.id);
        wasAdjusted = true;
      } 
      else {
        // update cart if quantity exceeds stock
        if (item.quantity > p.stockQuantity) {  
          item.quantity = p.stockQuantity; 
          wasAdjusted = true;
          
          await prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: p.stockQuantity }
          });
        }
        validItems.push(item);
      }
    }

    if (itemsToRemove.length > 0) {
      await prisma.cartItem.deleteMany({ where: { id: { in: itemsToRemove } }});
    }

    let rawSubtotal = 0; 
    let totalItems = 0;
    let totalSavings = 0;

    const formattedItems = validItems.map((item) => {
      const p = item.product;
      const originalPrice = Number(p.price);
      const activePrice = p.salePrice ? Number(p.salePrice) : originalPrice;
      const lineTotal = activePrice * item.quantity;

      const avgRating = p.reviews && p.reviews.length > 0 
        ? p.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / p.reviews.length 
        : 0;

      rawSubtotal += originalPrice * item.quantity; 
      totalItems += item.quantity;
      
      if (p.salePrice) {
        totalSavings += (originalPrice - activePrice) * item.quantity;
      }

      return {
        id: item.id,
        quantity: item.quantity,
        product: {
          id: p.id,
          title: p.title,
          imageLink: p.imageLink,
          price: activePrice, 
          originalPrice: originalPrice,
          stockQuantity: p.stockQuantity,
          availability: p.availability,
          averageRating: Number(avgRating.toFixed(1))
        },
        lineTotal: lineTotal
      };
    });

    const finalTotal = rawSubtotal - totalSavings;

    return NextResponse.json({
      success: true,
      data: {
        cartId: cart.id,
        items: formattedItems,
        summary: {
          subtotal: rawSubtotal.toFixed(2),
          totalSavings: totalSavings.toFixed(2),
          total: finalTotal.toFixed(2), 
          itemCount: totalItems
        },
        hasInventoryChanges: wasAdjusted
      }
    });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await req.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      select: { id: true, stockQuantity: true, availability: true }
    });

    if (!product || product.availability === "OUT_OF_STOCK" || product.stockQuantity < quantity) {
      return NextResponse.json({ success: false, message: "Product unavailable" }, { status: 400 });
    }

    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } }
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stockQuantity) {
        return NextResponse.json({ success: false, message: "Exceeds stock" }, { status: 400 });
      }
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty }
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity }
      });
    }

    return NextResponse.json({ success: true, message: "Added to cart" });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}