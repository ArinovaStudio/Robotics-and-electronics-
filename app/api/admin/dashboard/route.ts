import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
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

    // Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: { stockQuantity: { lt: 10 }, isActive: true },
      select: { id: true, title: true, sku: true, stockQuantity: true },
      orderBy: { stockQuantity: "asc" },
      take: 5,
    });

    // Top selling products
    const topSellingData = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const topSellingProductIds = topSellingData.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: topSellingProductIds } },
      select: { id: true, title: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p.title]));

    const topSellingProductsWithRevenue = topSellingData.map((item) => ({
      id: item.productId,
      title: productMap.get(item.productId) || "Unknown Product",
      totalSold: item._sum.quantity || 0,
    }));

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const chartOrders = await prisma.order.findMany({
      where: {
        orderedAt: { gte: oneYearAgo },
        status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      select: { orderedAt: true, totalAmount: true },
    });

    const weeklyMap = new Map();
    const monthlyMap = new Map();
    const yearlyMap = new Map();

    // Init Week (Last 7 days)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      weeklyMap.set(d.toISOString().split("T")[0], {
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        sale: 0,
        purchase: 0,
      });
    }
    // Init Month (Last 4 weeks)
    for (let i = 3; i >= 0; i--) {
      monthlyMap.set(`Week ${4 - i}`, {
        date: `Week ${4 - i}`,
        sale: 0,
        purchase: 0,
      });
    }
    // Init Year (Last 12 months)
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      yearlyMap.set(`${d.getFullYear()}-${d.getMonth()}`, {
        date: d.toLocaleDateString("en-US", { month: "short" }),
        sale: 0,
        purchase: 0,
      });
    }

    // Populate chart buckets
    chartOrders.forEach((order) => {
      const dateStr = order.orderedAt.toISOString().split("T")[0];
      const amt = Number(order.totalAmount);

      // Weekly
      if (weeklyMap.has(dateStr)) {
        const entry = weeklyMap.get(dateStr);
        entry.sale += amt;
        entry.purchase += amt * 0.7;
      }

      // Monthly
      const daysAgo = Math.floor(
        (now.getTime() - order.orderedAt.getTime()) / (1000 * 3600 * 24),
      );
      if (daysAgo <= 28) {
        const weekNum = 4 - Math.floor(daysAgo / 7);
        const weekKey = `Week ${weekNum}`;
        if (monthlyMap.has(weekKey)) {
          const entry = monthlyMap.get(weekKey);
          entry.sale += amt;
          entry.purchase += amt * 0.7;
        }
      }

      // Yearly
      const yearKey = `${order.orderedAt.getFullYear()}-${order.orderedAt.getMonth()}`;
      if (yearlyMap.has(yearKey)) {
        const entry = yearlyMap.get(yearKey);
        entry.sale += amt;
        entry.purchase += amt * 0.7;
      }
    });

    return successResponse({
      overview: { totalOrders, totalRevenue, totalCustomers, totalProducts },
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
      topSellingProducts: topSellingProductsWithRevenue,
      chartData: {
        weekly: Array.from(weeklyMap.values()),
        monthly: Array.from(monthlyMap.values()),
        yearly: Array.from(yearlyMap.values()),
      },
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
