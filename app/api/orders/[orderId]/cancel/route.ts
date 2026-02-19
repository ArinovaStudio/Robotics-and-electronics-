import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    // Authenticate user
    const user = await requireAuth();
    const userId = user.id;

    const { orderId } = await params;

    // Parse request body
    const body = await request.json();
    const reason = body.reason || "Customer requested cancellation";

    // Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      },
    });

    if (!order) {
      return notFoundResponse("Order not found");
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      return errorResponse("Unauthorized", 403);
    }

    // Check if order can be cancelled (only PENDING or CONFIRMED)
    const cancellableStatuses = ["PENDING", "CONFIRMED"];
    if (!cancellableStatuses.includes(order.status)) {
      return errorResponse(
        `Order cannot be cancelled. Order is already ${order.status.toLowerCase()}`,
        400,
      );
    }

    // Begin transaction
    await prisma.$transaction(async (tx) => {
      // Update order status to CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          notes: order.notes
            ? `${order.notes}\n\nCancellation reason: ${reason}`
            : `Cancellation reason: ${reason}`,
        },
      });

      // Restore product stock quantities
      await Promise.all(
        order.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          }),
        ),
      );

      // If payment was made and successful, update payment status to indicate refund
      if (order.payment && order.payment.status === "SUCCESS") {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: "REFUNDED",
          },
        });
      }
    });

    // Determine refund message
    let refundStatus = null;
    if (order.payment && order.payment.status === "SUCCESS") {
      refundStatus = "Refund will be processed within 5-7 business days";
    }

    return successResponse(
      {
        orderId: order.id,
        status: "CANCELLED",
        refundStatus,
      },
      "Order cancelled successfully",
    );
  } catch (error) {
    console.error("Cancel order error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Internal server error", 500);
  }
}
