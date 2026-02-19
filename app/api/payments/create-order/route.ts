import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";
import { createRazorpayOrderSchema } from "@/app/lib/validations/payment";
import razorpay from "@/app/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();
    const userId = user.id;

    // Parse and validate request body
    const body = await request.json();
    const validation = createRazorpayOrderSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0]?.message || "Invalid request data",
        400,
      );
    }

    const { orderId } = validation.data;

    // Fetch order with payment info
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return notFoundResponse("Order not found");
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      return errorResponse("Unauthorized", 403);
    }

    // Check order status is PENDING
    if (order.status !== "PENDING") {
      return errorResponse(
        `Cannot create payment for order with status ${order.status}`,
        400,
      );
    }

    // Check if Razorpay order already exists
    if (order.payment && order.payment.razorpayOrderId) {
      // Return existing Razorpay order details
      return successResponse({
        razorpayOrderId: order.payment.razorpayOrderId,
        amount: order.payment.amount.toString(),
        currency: order.payment.currency,
        orderId: order.id,
        orderNumber: order.orderNumber,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    // Convert amount to paise (multiply by 100)
    const amountInPaise = Math.round(Number(order.totalAmount) * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userId: userId,
        orderNumber: order.orderNumber,
      },
    });

    // Create or update Payment record
    const payment = await prisma.payment.upsert({
      where: {
        orderId: order.id,
      },
      update: {
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        currency: "INR",
        status: "PENDING",
      },
      create: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        currency: "INR",
        status: "PENDING",
      },
    });

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      amount: payment.amount.toString(),
      currency: payment.currency,
      orderId: order.id,
      orderNumber: order.orderNumber,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Internal server error", 500);
  }
}
