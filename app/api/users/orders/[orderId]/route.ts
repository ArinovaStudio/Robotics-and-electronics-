import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET( request: NextRequest, { params }: { params: Promise<{ orderId: string }> } ) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { address: true, payment: true, items: true }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      
      subtotal: Number(order.subtotal).toFixed(2),
      discount: Number(order.discount).toFixed(2),
      shippingCost: Number(order.shippingCost).toFixed(2),
      taxAmount: Number(order.taxAmount).toFixed(2),
      totalAmount: Number(order.totalAmount).toFixed(2),
      
      address: order.address,
      payment: {
        razorpayPaymentId: order.payment?.razorpayPaymentId,
        status: order.payment?.status,
        method: order.payment?.paymentMethod,
        paidAt: order.payment?.paidAt,
      },
      
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: Number(item.priceAtPurchase).toFixed(2),
        snapshot: typeof item.productSnapshot === 'string' ? JSON.parse(item.productSnapshot) : item.productSnapshot
      }))
    };

    return NextResponse.json({ success: true, data: formattedOrder }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}