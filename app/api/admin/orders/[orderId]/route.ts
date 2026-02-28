import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getAdminUser } from "@/lib/auth";
import { z } from "zod";

export async function GET( req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        address: true,
        items: {
          include: {
            product: {
              select: { id: true, title: true, imageLink: true, sku: true },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const formattedOrder = {
      ...order,
      subtotal: order.subtotal.toString(),
      shippingCost: order.shippingCost.toString(),
      taxAmount: order.taxAmount.toString(),
      discount: order.discount.toString(),
      totalAmount: order.totalAmount.toString(),
      items: order.items.map((item) => ({
        ...item,
        priceAtPurchase: item.priceAtPurchase.toString(),
      })),
    };

    return NextResponse.json({ success: true, data: formattedOrder });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  trackingNumber: z.string().optional().nullable(),
  trackingUrl: z.string().url("Invalid tracking URL").optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PATCH( req: NextRequest, { params }: { params: Promise<{ orderId: string }> } ) {
  try {
    const admin = await getAdminUser();
    if (!admin){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await req.json();

    const validation = updateOrderStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const { status, trackingNumber, trackingUrl, notes } = validation.data;

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, notes: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED", "CANCELLED"],
      DELIVERED: ["REFUNDED"],
      CANCELLED: [],
      REFUNDED: [],
    };

    const allowed = validTransitions[currentOrder.status] || [];
    if (!allowed.includes(status) && status !== currentOrder.status) {
      return NextResponse.json({ 
        success: false, 
        message: `Invalid status change. Cannot move from ${currentOrder.status} to ${status}.` 
      }, { status: 400 });
    }

    const updateData: any = { status };

    if (status === "CONFIRMED") updateData.confirmedAt = new Date();
    if (status === "PROCESSING") updateData.processedAt = new Date();
    if (status === "SHIPPED") {
      updateData.shippedAt = new Date();
      updateData.trackingNumber = trackingNumber;
      updateData.trackingUrl = trackingUrl;
    }
    if (status === "DELIVERED") updateData.deliveredAt = new Date();
    if (status === "CANCELLED") updateData.cancelledAt = new Date();

    if (notes) {
      const timestamp = new Date().toLocaleString('en-IN');
      updateData.notes = currentOrder.notes ? `${currentOrder.notes}\n\n[${timestamp}]: ${notes}` : `[${timestamp}]: ${notes}`;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Order marked as ${status.toLowerCase()}`,
      data: updatedOrder
    });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}