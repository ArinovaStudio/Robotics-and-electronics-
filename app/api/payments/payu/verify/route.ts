import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { getOrderConfirmationTemplate } from "@/lib/templates";
import sendEmail from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const status = formData.get("status") as string;
    const txnid = formData.get("txnid") as string;
    const amount = formData.get("amount") as string;
    const productinfo = formData.get("productinfo") as string;
    const firstname = formData.get("firstname") as string;
    const email = formData.get("email") as string;
    const payuHash = formData.get("hash") as string;
    const mihpayid = formData.get("mihpayid") as string;
    const mode = formData.get("mode") as string; 
    
    const additionalCharges = formData.get("additionalCharges") as string | null;

    let reverseHashString = `${process.env.PAYU_MERCHANT_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.PAYU_MERCHANT_KEY}`;
    
    if (additionalCharges) {
        reverseHashString = `${additionalCharges}|${reverseHashString}`;
    }

    const calculatedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');

    if (calculatedHash === payuHash && status === "success") {
      const confirmedOrder = await prisma.$transaction(async (tx) => {

        const payment = await tx.payment.update({
          where: { payuTransactionId: txnid },
          data: {
            payuPaymentId: mihpayid,
            status: "SUCCESS",
            paidAt: new Date(),
            paymentMethod: mode,
          },
          include: { order: { include: { items: true, user: true } } }
        });

        const order = await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "CONFIRMED", confirmedAt: new Date() },
          include: { items: true, user: true }
        });

        if (order.couponId) {
          await tx.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } });
        }

        for (const item of order.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { decrement: item.quantity } } });
        }
        await tx.cartItem.deleteMany({ where: { cart: { userId: order.userId } } });

        return order;
      }, { maxWait: 10000, timeout: 20000 });

      const emailHtml = getOrderConfirmationTemplate(
        confirmedOrder.user.name || "Customer", 
        confirmedOrder.orderNumber, 
        Number(confirmedOrder.totalAmount), 
        confirmedOrder.items
      );
      await sendEmail(confirmedOrder.user.email, `Order Confirmed! #${confirmedOrder.orderNumber} - Robotics Store`, emailHtml);

      return NextResponse.redirect(new URL('/orders', request.url));
    } 
    
    else {
      const payment = await prisma.payment.findUnique({ where: { payuTransactionId: txnid } });
      
      if (payment) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.delete({ where: { id: payment.id } });
          await tx.orderItem.deleteMany({ where: { orderId: payment.orderId } });
          await tx.order.delete({ where: { id: payment.orderId } });
        });
      }

      return NextResponse.redirect(new URL('/cart?error=payment_failed', request.url));
    }

  } catch {
    return NextResponse.redirect(new URL('/cart?error=payment_failed', request.url));
  }
}