import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import crypto from "crypto";
import { sendOrderConfirmationEmail } from "@/app/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return errorResponse("Missing webhook signature", 400);
    }

    // Get raw body
    const body = await request.text();

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return errorResponse("Invalid webhook signature", 400);
    }

    // Parse event
    const event = JSON.parse(body);
    const eventType = event.event;
    const payload = event.payload;

    // Handle different event types
    switch (eventType) {
      case "payment.captured": {
        const paymentEntity = payload.payment.entity;
        const razorpayPaymentId = paymentEntity.id;
        const razorpayOrderId = paymentEntity.order_id;

        // Find payment by razorpay order id
        const payment = await prisma.payment.findUnique({
          where: { razorpayOrderId },
          include: { order: true },
        });

        if (!payment) {
          console.error(`Payment not found for order: ${razorpayOrderId}`);
          return successResponse(null, "Payment not found");
        }

        // Extract payment method details
        const paymentMethod = paymentEntity.method;
        let cardLast4 = null;
        let cardNetwork = null;
        let bankName = null;
        let vpa = null;
        let walletName = null;

        if (paymentMethod === "card") {
          cardLast4 = paymentEntity.card?.last4 || null;
          cardNetwork = paymentEntity.card?.network || null;
        } else if (paymentMethod === "netbanking") {
          bankName = paymentEntity.bank || null;
        } else if (paymentMethod === "upi") {
          vpa = paymentEntity.vpa || null;
        } else if (paymentMethod === "wallet") {
          walletName = paymentEntity.wallet || null;
        }

        // Update payment status to SUCCESS
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId,
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

        // Update order status to CONFIRMED if not already
        if (payment.order.status === "PENDING") {
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
        }

        break;
      }

      case "payment.failed": {
        const paymentEntity = payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;
        const failureReason =
          paymentEntity.error_description || "Payment failed";
        const failureCode = paymentEntity.error_code || null;

        // Find payment by razorpay order id
        const payment = await prisma.payment.findUnique({
          where: { razorpayOrderId },
        });

        if (!payment) {
          console.error(`Payment not found for order: ${razorpayOrderId}`);
          return successResponse(null, "Payment not found");
        }

        // Update payment status to FAILED
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            failureReason,
            failureCode,
          },
        });

        console.log(`Payment failed for order: ${razorpayOrderId}`);
        break;
      }

      case "refund.created": {
        const refundEntity = payload.refund.entity;
        const razorpayPaymentId = refundEntity.payment_id;
        const refundAmount = refundEntity.amount / 100; // Convert from paise

        // Find payment by razorpay payment id
        const payment = await prisma.payment.findFirst({
          where: { razorpayPaymentId },
          include: { order: true },
        });

        if (!payment) {
          console.error(
            `Payment not found for payment id: ${razorpayPaymentId}`,
          );
          return successResponse(null, "Payment not found");
        }

        const totalAmount = Number(payment.amount);
        const isPartialRefund = refundAmount < totalAmount;

        // Update payment status to REFUNDED or PARTIALLY_REFUNDED
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: isPartialRefund ? "PARTIALLY_REFUNDED" : "REFUNDED",
          },
        });

        // Update order status if full refund
        if (!isPartialRefund && payment.order.status !== "REFUNDED") {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: "REFUNDED",
            },
          });
        }

        break;
      }
    }

    return successResponse(null, "Webhook processed");
  } catch {
    return errorResponse("Webhook processing failed", 500);
  }
}
