import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
    if (!existingOrder) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (existingOrder.userId !== user.id) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (existingOrder.status !== "PENDING") {
      return NextResponse.json({ success: false, message: "Order is no longer pending" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (existingOrder.payment) {
        await tx.payment.delete({ where: { id: existingOrder.payment.id } });
      }

      await tx.orderItem.deleteMany({ where: { orderId: orderId } });

      await tx.order.delete({ where: { id: orderId } });
    });

    return NextResponse.json({ success: true, message: "Order cancelled" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}