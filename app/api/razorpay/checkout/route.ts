import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import razorpay from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { addressId } = await request.json();
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
    let totalDiscount = 0;

    for (const item of cart.items) {
      const p = item.product;
      if (!p.isActive || p.category?.isActive === false || p.availability === "OUT_OF_STOCK" || p.stockQuantity < item.quantity) {
        return NextResponse.json({ success: false, message: `Item ${p.title} is out of stock or unavailable.` }, { status: 400 });
      }
      
      const originalPrice = Number(p.price);
      const activePrice = p.salePrice ? Number(p.salePrice) : originalPrice;
      
      subtotal += originalPrice * item.quantity;

      if (p.salePrice) {
        totalDiscount += (originalPrice - activePrice) * item.quantity;
      }
    }

    const totalAmount = subtotal - totalDiscount;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), 
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${user.id.substring(0, 5)}`,
    });

    let orderNumber = "";
    let isUnique = false;
    
    while (!isUnique) {
      orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      
      const existingOrder = await prisma.order.findUnique({ where: { orderNumber }, select: { id: true } });
      
      if (!existingOrder) {
        isUnique = true;
      }
    }

    const newOrder = await prisma.$transaction(async (tx) => {

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          addressId,
          status: "PENDING",
          subtotal: subtotal,
          discount: totalDiscount,
          totalAmount: totalAmount,
          items: {
            create: cart.items.map((item) => {
              const activePrice = item.product.salePrice ? Number(item.product.salePrice) : Number(item.product.price);
              return {
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: activePrice,
                productSnapshot: { 
                  title: item.product.title,
                  image: item.product.imageLink,
                  sku: item.product.sku,
                }
              };
            })
          },
          payment: {
            create: {
              razorpayOrderId: razorpayOrder.id,
              amount: totalAmount,
              status: "PENDING",
            }
          }
        },
        include: { payment: true }
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      data: { orderId: newOrder.id, razorpayOrderId: razorpayOrder.id, amount: totalAmount, currency: "INR"
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}