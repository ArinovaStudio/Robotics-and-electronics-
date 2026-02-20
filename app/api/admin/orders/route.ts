import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { adminListOrdersQuerySchema } from "@/app/lib/validations/admin-order";

// GET /api/admin/orders - List all orders with filters
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());

    const validation = adminListOrdersQuerySchema.safeParse(queryObject);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const {
      page,
      limit,
      search,
      status,
      startDate,
      endDate,
      paymentStatus,
      sort,
    } = validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search in order number, customer name, email
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Filter by order status
    if (status) {
      where.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      where.orderedAt = {};
      if (startDate) {
        where.orderedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.orderedAt.lte = new Date(endDate);
      }
    }

    // Payment status filter
    if (paymentStatus) {
      where.payment = {
        status: paymentStatus,
      };
    }

    // Build orderBy clause
    let orderBy: any = { orderedAt: "desc" };
    switch (sort) {
      case "oldest":
        orderBy = { orderedAt: "asc" };
        break;
      case "amount_high":
        orderBy = { totalAmount: "desc" };
        break;
      case "amount_low":
        orderBy = { totalAmount: "asc" };
        break;
      case "newest":
      default:
        orderBy = { orderedAt: "desc" };
    }

    // Fetch orders and total count in parallel
    const [orders, total, statusCounts] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payment: {
            select: {
              status: true,
              paymentMethod: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // Format orders for response
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      user: order.user,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      itemCount: order._count.items,
      payment: order.payment
        ? {
            status: order.payment.status,
            paymentMethod: order.payment.paymentMethod,
          }
        : null,
      orderedAt: order.orderedAt.toISOString(),
    }));

    // Build summary from status counts
    const summary: any = {
      total,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    statusCounts.forEach((item) => {
      const statusKey = item.status.toLowerCase();
      summary[statusKey] = item._count.id;
    });

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      orders: formattedOrders,
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
