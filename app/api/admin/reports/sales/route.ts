import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { salesReportQuerySchema } from "@/app/lib/validations/admin-report";

// GET /api/admin/reports/sales - Sales report with timeline and analytics
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());

    const validation = salesReportQuerySchema.safeParse(queryObject);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { startDate, endDate, groupBy, category } = validation.data;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Build where clause for orders
    const orderWhere: any = {
      orderedAt: {
        gte: start,
        lte: end,
      },
      status: {
        in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
      },
    };

    // Category filter
    let categoryId: string | undefined;
    if (category) {
      const categoryRecord = await prisma.category.findFirst({
        where: { slug: category },
        select: { id: true },
      });
      if (categoryRecord) {
        categoryId = categoryRecord.id;
      }
    }

    // Fetch orders in date range
    const orders = await prisma.order.findMany({
      where: orderWhere,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Filter by category if specified
    let filteredOrders = orders;
    if (categoryId) {
      filteredOrders = orders.filter((order) =>
        order.items.some((item) => item.product.categoryId === categoryId),
      );
    }

    // Calculate summary
    let totalRevenue = 0;
    let totalItemsSold = 0;

    filteredOrders.forEach((order) => {
      totalRevenue += Number(order.totalAmount);
      order.items.forEach((item) => {
        if (!categoryId || item.product.categoryId === categoryId) {
          totalItemsSold += item.quantity;
        }
      });
    });

    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Build timeline based on groupBy
    const timelineMap = new Map<string, { revenue: number; orders: number }>();

    filteredOrders.forEach((order) => {
      const orderDate = new Date(order.orderedAt);
      let key: string;

      switch (groupBy) {
        case "week":
          // Get ISO week number
          const weekStart = new Date(orderDate);
          weekStart.setDate(orderDate.getDate() - orderDate.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "day":
        default:
          key = orderDate.toISOString().split("T")[0];
      }

      const existing = timelineMap.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += Number(order.totalAmount);
      existing.orders += 1;
      timelineMap.set(key, existing);
    });

    const timeline = Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top products
    const productSales = new Map<
      string,
      { title: string; quantity: number; revenue: number }
    >();

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!categoryId || item.product.categoryId === categoryId) {
          const existing = productSales.get(item.productId) || {
            title: item.product.title,
            quantity: 0,
            revenue: 0,
          };
          existing.quantity += item.quantity;
          existing.revenue += Number(item.priceAtPurchase) * item.quantity;
          productSales.set(item.productId, existing);
        }
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        title: data.title,
        quantitySold: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top categories
    const categorySales = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!categoryId || item.product.categoryId === categoryId) {
          const catId = item.product.categoryId;
          const catName = item.product.category.name;
          const existing = categorySales.get(catId) || {
            name: catName,
            quantity: 0,
            revenue: 0,
          };
          existing.quantity += item.quantity;
          existing.revenue += Number(item.priceAtPurchase) * item.quantity;
          categorySales.set(catId, existing);
        }
      });
    });

    const topCategories = Array.from(categorySales.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        name: data.name,
        quantitySold: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return successResponse({
      period: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalItemsSold,
      },
      timeline,
      topProducts,
      topCategories,
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
