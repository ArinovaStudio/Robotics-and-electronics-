import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { getOrderConfirmationTemplate } from "@/lib/templates";
import sendEmail from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { addressId, couponCode } = await request.json();
    if (!addressId){
        return NextResponse.json({ success: false, message: "Address is required" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { category: true } } } }}
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    let subtotal = 0;
    let productDiscount = 0;

    for (const item of cart.items) {
      const p = item.product;
      if (!p.isActive || p.category?.isActive === false || p.availability === "OUT_OF_STOCK" || p.stockQuantity < item.quantity) {
        return NextResponse.json({ success: false, message: `Item ${p.title} is out of stock or unavailable.` }, { status: 400 });
      }
      
      const originalPrice = Number(p.price);
      const activePrice = p.salePrice ? Number(p.salePrice) : originalPrice;
      
      subtotal += originalPrice * item.quantity;
      if (p.salePrice) {
        productDiscount += (originalPrice - activePrice) * item.quantity;
      }
    }

    let totalAmount = subtotal - productDiscount;
    let finalCouponDiscount = 0;
    let validCoupon = null;

    if (couponCode) {
      validCoupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase().trim() } });

      const now = new Date();
      if (
        validCoupon && validCoupon.isActive &&
        (!validCoupon.startDate || now >= validCoupon.startDate) &&
        (!validCoupon.expiryDate || now <= validCoupon.expiryDate) &&
        (!validCoupon.usageLimit || validCoupon.usedCount < validCoupon.usageLimit) &&
        (!validCoupon.minOrderAmount || totalAmount >= Number(validCoupon.minOrderAmount))
      ) {
        if (validCoupon.discountType === "PERCENTAGE") {
          finalCouponDiscount = totalAmount * (Number(validCoupon.discountValue) / 100);
          if (validCoupon.maxDiscountAmount) {
            finalCouponDiscount = Math.min(finalCouponDiscount, Number(validCoupon.maxDiscountAmount));
          }
        } else {
          finalCouponDiscount = Number(validCoupon.discountValue);
        }
        
        finalCouponDiscount = Math.min(finalCouponDiscount, totalAmount);
        totalAmount -= finalCouponDiscount;
      } else {
        return NextResponse.json({ success: false, message: "Coupon is no longer valid." }, { status: 400 });
      }
    }

    const totalDiscount = productDiscount + finalCouponDiscount;

    let orderNumber = "";
    let isUnique = false;
    
    while (!isUnique) {
      orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      const existingOrder = await prisma.order.findUnique({ where: { orderNumber }, select: { id: true } });
      if (!existingOrder) isUnique = true;
    }

    const confirmedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          addressId,
          couponId: validCoupon?.id,
          couponCode: validCoupon?.code,
          status: "CONFIRMED", 
          confirmedAt: new Date(),
          subtotal, discount: totalDiscount, totalAmount,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.salePrice ? Number(item.product.salePrice) : Number(item.product.price),
              productSnapshot: { title: item.product.title, image: item.product.imageLink, sku: item.product.sku }
            }))
          },
          payment: {
            create: {
              amount: totalAmount,
              status: "PENDING",
              paymentMethod: "COD"
            }
          }
        },
        include: { items: true }
      });

      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { decrement: item.quantity } } });
      }

      if (validCoupon) {
        await tx.coupon.update({ where: { id: validCoupon.id }, data: { usedCount: { increment: 1 } } });
      }

      await tx.cartItem.deleteMany({ where: { cart: { userId: user.id } } });

      return order;
    });

    const emailHtml = getOrderConfirmationTemplate(user.name || "Customer", confirmedOrder.orderNumber, totalAmount, confirmedOrder.items, true);
    await sendEmail(user.email, `Order Confirmed! #${confirmedOrder.orderNumber} - Robotics Store`, emailHtml);

    return NextResponse.json({ success: true, data: { orderId: confirmedOrder.id } }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}