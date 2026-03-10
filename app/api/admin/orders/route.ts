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
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sort = searchParams.get("sort") || "newest";

    const skip = (page - 1) * limit;

    const where: any = { status: { not: "PENDING" } };

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.payment = { status: paymentStatus };
    }

    if (startDate || endDate) {
      where.orderedAt = {};
      if (startDate) where.orderedAt.gte = new Date(startDate);
      if (endDate) where.orderedAt.lte = new Date(endDate);
    }

    let orderBy: any = { orderedAt: "desc" };
    if (sort === "oldest") orderBy = { orderedAt: "asc" };
    if (sort === "amount_high") orderBy = { totalAmount: "desc" };
    if (sort === "amount_low") orderBy = { totalAmount: "asc" };

    const [orders, total, statusCounts] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          payment: { select: { status: true, paymentMethod: true } },
          _count: { select: { items: true } },
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

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user ? {
        name: order.user.name,
        email: order.user.email
      } : { name: "Guest User", email: "N/A" },
      status: order.status,
      totalAmount: Number(order.totalAmount).toFixed(2),
      itemCount: order._count.items,
      payment: order.payment ? {
        status: order.payment.status,
        method: order.payment.paymentMethod,
      } : null,
      orderedAt: order.orderedAt,
    }));

    const summary: any = {
      total,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    };

    statusCounts.forEach((item) => {
      const key = item.status.toLowerCase();
      if (key in summary) summary[key] = item._count.id;
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      message: "Orders fetched successfully",
      data: {
        orders: formattedOrders,
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