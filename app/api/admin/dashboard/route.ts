import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse } from "@/app/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Calculate date ranges
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Overview stats
    const [totalOrders, totalCustomers, totalProducts, revenueData] =
      await Promise.all([
        prisma.order.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.product.count(),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: {
            status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
          },
        }),
      ]);

    const totalRevenue = revenueData._sum.totalAmount || 0;

    // Recent stats
    const [
      ordersTodayCount,
      revenueTodayData,
      ordersWeekCount,
      revenueWeekData,
      ordersMonthCount,
      revenueMonthData,
    ] = await Promise.all([
      prisma.order.count({ where: { orderedAt: { gte: startOfToday } } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          orderedAt: { gte: startOfToday },
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      }),
      prisma.order.count({ where: { orderedAt: { gte: startOfWeek } } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          orderedAt: { gte: startOfWeek },
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      }),
      prisma.order.count({ where: { orderedAt: { gte: startOfMonth } } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          orderedAt: { gte: startOfMonth },
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      }),
    ]);

    const revenueToday = revenueTodayData._sum.totalAmount || 0;
    const revenueThisWeek = revenueWeekData._sum.totalAmount || 0;
    const revenueThisMonth = revenueMonthData._sum.totalAmount || 0;

    // Orders by status
    const orderStatusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const ordersByStatus = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    orderStatusCounts.forEach((item) => {
      ordersByStatus[item.status as keyof typeof ordersByStatus] =
        item._count.id;
    });

    // Low stock products (stock < 10)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stockQuantity: { lt: 10 },
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        sku: true,
        stockQuantity: true,
      },
      orderBy: { stockQuantity: "asc" },
      take: 10,
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { orderedAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const recentOrdersFormatted = recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user.name || "Guest",
      totalAmount: order.totalAmount.toString(),
      status: order.status,
      orderedAt: order.orderedAt.toISOString(),
    }));

    // Top selling products
    const topSellingData = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        priceAtPurchase: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const topSellingProductIds = topSellingData.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: topSellingProductIds } },
      select: { id: true, title: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p.title]));

    // Fetch all order items for top products in one query
    const allOrderItems = await prisma.orderItem.findMany({
      where: {
        productId: { in: topSellingProductIds },
        order: {
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      },
      select: { productId: true, quantity: true, priceAtPurchase: true },
    });

    // Group order items by productId
    const itemsByProduct = new Map<string, typeof allOrderItems>();
    allOrderItems.forEach((item) => {
      if (!itemsByProduct.has(item.productId)) {
        itemsByProduct.set(item.productId, []);
      }
      itemsByProduct.get(item.productId)!.push(item);
    });

    // Calculate revenue for each product
    const topSellingProductsWithRevenue = topSellingData.map((item) => {
      const orderItems = itemsByProduct.get(item.productId) || [];
      const revenue = orderItems.reduce((sum, oi) => {
        return sum + Number(oi.priceAtPurchase) * oi.quantity;
      }, 0);

      return {
        id: item.productId,
        title: productMap.get(item.productId) || "Unknown Product",
        totalSold: item._sum.quantity || 0,
        revenue,
      };
    });

    return successResponse({
      overview: {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
      },
      recentStats: {
        ordersToday: ordersTodayCount,
        revenueToday,
        ordersThisWeek: ordersWeekCount,
        revenueThisWeek,
        ordersThisMonth: ordersMonthCount,
        revenueThisMonth,
      },
      ordersByStatus,
      lowStockProducts,
      recentOrders: recentOrdersFormatted,
      topSellingProducts: topSellingProductsWithRevenue,
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
