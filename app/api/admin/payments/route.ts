import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { adminListPaymentsQuerySchema } from "@/app/lib/validations/admin-payment";

// GET /api/admin/payments - List all payments with filters
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());

    const validation = adminListPaymentsQuerySchema.safeParse(queryObject);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { page, limit, status, startDate, endDate, paymentMethod } =
      validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter by payment status
    if (status) {
      where.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Payment method filter
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    // Fetch payments and calculate summary in parallel
    const [payments, total, summaryData] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
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
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Format payments for response
    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      razorpayPaymentId: payment.razorpayPaymentId,
      amount: payment.amount.toString(),
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      cardNetwork: payment.cardNetwork,
      cardLast4: payment.cardLast4,
      vpa: payment.vpa,
      walletName: payment.walletName,
      bankName: payment.bankName,
      paidAt: payment.paidAt?.toISOString() || null,
      createdAt: payment.createdAt.toISOString(),
      user: payment.order.user,
    }));

    // Calculate summary
    const summary = {
      totalSuccessful: 0,
      totalFailed: 0,
      totalPending: 0,
      totalRefunded: 0,
    };

    summaryData.forEach((item) => {
      const amount = Number(item._sum.amount) || 0;
      switch (item.status) {
        case "SUCCESS":
          summary.totalSuccessful += amount;
          break;
        case "FAILED":
          summary.totalFailed += amount;
          break;
        case "PENDING":
        case "PROCESSING":
          summary.totalPending += amount;
          break;
        case "REFUNDED":
        case "PARTIALLY_REFUNDED":
          summary.totalRefunded += amount;
          break;
      }
    });

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      payments: formattedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary,
    });
  } catch (error: any) {
    return (
      error.response ||
      new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500 },
      )
    );
  }
}
