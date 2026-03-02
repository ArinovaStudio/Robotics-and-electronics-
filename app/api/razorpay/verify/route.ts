import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { getUser } from "@/lib/auth";
import { getOrderConfirmationTemplate } from "@/lib/templates";
import sendEmail from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, message: "Missing payment details" }, { status: 400 });
    }

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: "FAILED", failureReason: "Signature mismatch" }
      });
      return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 });
    }

    const confirmedOrder = await prisma.$transaction(async (tx) => {

      await tx.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "SUCCESS",
          paidAt: new Date(),
        }
      });

      const order = await tx.order.update({
        where: { id: orderId },
        data: { 
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
        include: { items: true }
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } }
        });
      }

      await tx.cartItem.deleteMany({ where: { cart: { userId: user.id } } });

      return order;
    });

    const emailHtml = getOrderConfirmationTemplate(
      user.name || "Customer",
      confirmedOrder.orderNumber,
      Number(confirmedOrder.totalAmount),
      confirmedOrder.items
    );

    await sendEmail( user.email, `Order Confirmed! #${confirmedOrder.orderNumber} - Robotics Store`, emailHtml );

    return NextResponse.json({ success: true, message: "Payment verified and order confirmed!" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Failed to verify payment" }, { status: 500 });
  }
}