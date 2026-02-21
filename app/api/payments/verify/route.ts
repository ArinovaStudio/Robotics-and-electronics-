import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";
import { verifyPaymentSchema } from "@/app/lib/validations/payment";
import razorpay from "@/app/lib/razorpay";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "@/app/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();
    const userId = user.id;

    // Parse and validate request body
    const body = await request.json();
    const validation = verifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0]?.message || "Invalid request data",
        400,
      ); 
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      validation.data;

    // Find payment record by razorpay_order_id
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return notFoundResponse("Payment not found");
    }

    // Verify order belongs to user
    if (payment.order.userId !== userId) {
      return errorResponse("Unauthorized", 403);
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Update payment status to FAILED
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          failureReason: "Invalid signature",
        },
      });

      return errorResponse(
        "Payment verification failed. Invalid signature",
        400,
      );
    }

    // Fetch payment details from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    // Extract payment method details
    const paymentMethod = razorpayPayment.method;
    let cardLast4 = null;
    let cardNetwork = null;
    let bankName = null;
    let vpa = null;
    let walletName = null;

    if (paymentMethod === "card") {
      cardLast4 = razorpayPayment.card?.last4 || null;
      cardNetwork = razorpayPayment.card?.network || null;
    } else if (paymentMethod === "netbanking") {
      bankName = razorpayPayment.bank || null;
    } else if (paymentMethod === "upi") {
      vpa = razorpayPayment.vpa || null;
    } else if (paymentMethod === "wallet") {
      walletName = razorpayPayment.wallet || null;
    }

    // Update payment record with payment details
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "SUCCESS",
        paymentMethod,
        cardLast4,
        cardNetwork,
        bankName,
        vpa,
        walletName,
        paidAt: new Date(),
      },
    });

    // Update order status to CONFIRMED
    const updatedOrder = await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
      include: {
        user: true,
        items: true
      }
    });

    sendOrderConfirmationEmail(
        updatedOrder.user.email,
        updatedOrder.user.name,
        updatedOrder.orderNumber,
        updatedOrder.totalAmount.toString(),
        updatedOrder.items
    );

    return successResponse(
      {
        paymentId: updatedPayment.id,
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedPayment.status,
        amount: updatedPayment.amount.toString(),
      },
      "Payment verified successfully",
    );
  } catch (error) {
    console.error("Verify payment error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Internal server error", 500);
  }
}
