import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    // Authenticate user
    const user = await requireAuth();
    const userId = user.id;
    const isAdmin = user.role === "ADMIN";

    const { orderId } = await params;

    // Fetch order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                link: true,
                isActive: true,
              },
            },
          },
        },
        payment: true,
        address: true,
      },
    });

    if (!order) {
      return notFoundResponse("Order not found");
    }

    // Verify order belongs to user (or user is admin)
    if (!isAdmin && order.userId !== userId) {
      return errorResponse("Unauthorized", 403);
    }

    // Build timeline based on status timestamps
    const timeline: Array<{
      status: string;
      timestamp: Date;
      description: string;
    }> = [];

    if (order.orderedAt) {
      timeline.push({
        status: "PENDING",
        timestamp: order.orderedAt,
        description: "Order placed",
      });
    }

    if (order.confirmedAt) {
      timeline.push({
        status: "CONFIRMED",
        timestamp: order.confirmedAt,
        description: "Payment confirmed",
      });
    }

    if (order.processedAt) {
      timeline.push({
        status: "PROCESSING",
        timestamp: order.processedAt,
        description: "Order is being processed",
      });
    }

    if (order.shippedAt) {
      const trackingInfo = order.trackingNumber
        ? ` via tracking #${order.trackingNumber}`
        : "";
      timeline.push({
        status: "SHIPPED",
        timestamp: order.shippedAt,
        description: `Order shipped${trackingInfo}`,
      });
    }

    if (order.deliveredAt) {
      timeline.push({
        status: "DELIVERED",
        timestamp: order.deliveredAt,
        description: "Order delivered successfully",
      });
    }

    if (order.cancelledAt) {
      timeline.push({
        status: "CANCELLED",
        timestamp: order.cancelledAt,
        description: "Order cancelled",
      });
    }

    // Format response
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,

      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase.toString(),
        productSnapshot: item.productSnapshot,
        product: {
          id: item.product.id,
          link: item.product.link,
          isActive: item.product.isActive,
        },
      })),

      subtotal: order.subtotal.toString(),
      shippingCost: order.shippingCost.toString(),
      taxAmount: order.taxAmount.toString(),
      discount: order.discount.toString(),
      totalAmount: order.totalAmount.toString(),

      address: {
        name: order.address.name,
        phone: order.address.phone,
        addressLine1: order.address.addressLine1,
        addressLine2: order.address.addressLine2,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode,
      },

      payment: order.payment
        ? {
            id: order.payment.id,
            razorpayOrderId: order.payment.razorpayOrderId,
            razorpayPaymentId: order.payment.razorpayPaymentId,
            amount: order.payment.amount.toString(),
            status: order.payment.status,
            paymentMethod: order.payment.paymentMethod,
            cardLast4: order.payment.cardLast4,
            cardNetwork: order.payment.cardNetwork,
            bankName: order.payment.bankName,
            vpa: order.payment.vpa,
            walletName: order.payment.walletName,
            paidAt: order.payment.paidAt,
            failureReason: order.payment.failureReason,
          }
        : null,

      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      notes: order.notes,

      orderedAt: order.orderedAt,
      confirmedAt: order.confirmedAt,
      processedAt: order.processedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,

      timeline,
    };

    return successResponse(formattedOrder);
  } catch (error) {
    console.error("Get order details error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Internal server error", 500);
  }
}
