import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { updateOrderStatusSchema } from "@/app/lib/validations/admin-order";

// GET /api/admin/orders/[orderId] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireAdmin();

    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                imageLink: true,
                sku: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Format order for response
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

    return successResponse(formattedOrder);
  } catch (error: any) {
    return (
      error.response ||
      new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500 },
      )
    );
  }
}

// PATCH /api/admin/orders/[orderId] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    await requireAdmin();

    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        orderNumber: true,
      },
    });

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    const body = await request.json();

    const validation = updateOrderStatusSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { status, trackingNumber, trackingUrl, notes } = validation.data;

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
      REFUNDED: [],
    };

    const allowedStatuses = validTransitions[order.status];
    if (!allowedStatuses.includes(status)) {
      return errorResponse(
        `Cannot transition from ${order.status} to ${status}. Allowed: ${allowedStatuses.join(", ") || "None"}`,
        400,
      );
    }

    // Build update data with timestamps
    const updateData: any = {
      status,
    };

    // Update timestamp based on new status
    switch (status) {
      case "CONFIRMED":
        updateData.confirmedAt = new Date();
        break;
      case "PROCESSING":
        updateData.processedAt = new Date();
        break;
      case "SHIPPED":
        updateData.shippedAt = new Date();
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (trackingUrl) updateData.trackingUrl = trackingUrl;
        break;
      case "DELIVERED":
        updateData.deliveredAt = new Date();
        break;
      case "CANCELLED":
        updateData.cancelledAt = new Date();
        break;
    }

    // Append notes if provided
    if (notes) {
      const existingNotes = await prisma.order.findUnique({
        where: { id: orderId },
        select: { notes: true },
      });
      updateData.notes = existingNotes?.notes
        ? `${existingNotes.notes}\n\n[${new Date().toISOString()}] ${notes}`
        : notes;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        trackingNumber: true,
        trackingUrl: true,
        confirmedAt: true,
        processedAt: true,
        shippedAt: true,
        deliveredAt: true,
        cancelledAt: true,
      },
    });

    // Note: Send status update email to customer (implementation depends on email service)
    // await sendOrderStatusEmail(order.userId, order.orderNumber, status);

    return successResponse(updatedOrder, `Order status updated to ${status}.`);
  } catch (error: any) {
    return (
      error.response ||
      new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500 },
      )
    );
  }
}
