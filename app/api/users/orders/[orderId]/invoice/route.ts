import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser, getAdminUser } from "@/lib/auth";
import { generateInvoicePDF } from "@/lib/invoice";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;

    const user = await getUser();
    const admin = await getAdminUser();
    if (!user && !admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        items: { include: { product: true } },
        payment: true,
        coupon: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (!admin && order.userId !== user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const pdfBuffer = await generateInvoicePDF(order);
    const webBuffer = new Uint8Array(pdfBuffer);

    return new NextResponse(webBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${order.orderNumber}.pdf"`,
      },
    });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}