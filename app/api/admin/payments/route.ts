import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
    const status = searchParams.get("status") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (paymentMethod && paymentMethod !== "all") {
      where.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [payments, total, summaryData] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              user: {
                select: { name: true, email: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
      prisma.payment.groupBy({
        by: ["status"],
        _sum: { amount: true },
      }),
    ]);

    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      razorpayPaymentId: payment.razorpayPaymentId,
      amount: Number(payment.amount).toFixed(2),
      status: payment.status,
      method: payment.paymentMethod,
      details: {
        cardNetwork: payment.cardNetwork,
        cardLast4: payment.cardLast4,
        vpa: payment.vpa,
        wallet: payment.walletName,
        bank: payment.bankName,
      },
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      customer: payment.order.user ? {
        name: payment.order.user.name,
        email: payment.order.user.email
      } : { name: "Guest User", email: "N/A" },
    }));

    const summary = {
      successful: 0,
      failed: 0,
      pending: 0,
      refunded: 0,
    };

    summaryData.forEach((item) => {
      const amount = Number(item._sum.amount) || 0;
      const s = item.status;

      if (s === "SUCCESS") summary.successful += amount;
      else if (s === "FAILED") summary.failed += amount;
      else if (s === "PENDING" || s === "PROCESSING") summary.pending += amount;
      else if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED") summary.refunded += amount;
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        payments: formattedPayments,
        summary,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        }
      }
    });

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}