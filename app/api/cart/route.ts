import { NextResponse } from "next/server";
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
                category: { select: { isActive: true } }
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

    let subtotal = 0;
    let totalItems = 0;
    let totalSavings = 0;

    const formattedItems = validItems.map((item) => {
      const p = item.product;
      const originalPrice = Number(p.price);
      const activePrice = p.salePrice ? Number(p.salePrice) : originalPrice;
      const lineTotal = activePrice * item.quantity;

      subtotal += lineTotal;
      totalItems += item.quantity;
      if (p.salePrice) {
        totalSavings += (originalPrice - activePrice) * item.quantity;
      }

      return {
        cartItemId: item.id,
        productId: p.id,
        title: p.title,
        image: p.imageLink,
        quantity: item.quantity,
        price: activePrice.toFixed(2),
        originalPrice: originalPrice.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
        maxStock: p.stockQuantity
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        cartId: cart.id,
        items: formattedItems,
        summary: {
          subtotal: subtotal.toFixed(2),
          totalSavings: totalSavings.toFixed(2),
          itemCount: totalItems
        },
        hasInventoryChanges: wasAdjusted
      }
    });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}