import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { inventoryReportQuerySchema } from "@/app/lib/validations/admin-report";

// GET /api/admin/reports/inventory - Inventory report with stock levels
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());

    const validation = inventoryReportQuerySchema.safeParse(queryObject);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { category, status } = validation.data;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    // Category filter
    if (category) {
      const categoryRecord = await prisma.category.findFirst({
        where: { slug: category },
        select: { id: true },
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }

    // Status filter (low_stock = < 20, out_of_stock = 0)
    if (status === "low_stock") {
      where.stockQuantity = {
        gt: 0,
        lt: 20,
      };
    } else if (status === "out_of_stock") {
      where.stockQuantity = 0;
    } else if (status === "in_stock") {
      where.stockQuantity = {
        gte: 20,
      };
    }

    // Fetch all products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate summary
    let totalProducts = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalInventoryValue = 0;

    products.forEach((product) => {
      const price =
        typeof product.price === "object" && product.price !== null
          ? (product.price as any).value
          : Number(product.price);

      totalInventoryValue += price * product.stockQuantity;

      if (product.stockQuantity === 0) {
        outOfStock++;
      } else if (product.stockQuantity < 20) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    // Low stock alerts (stock < 20 but > 0)
    const lowStockAlerts = products
      .filter((p) => p.stockQuantity > 0 && p.stockQuantity < 20)
      .map((p) => {
        const price =
          typeof p.price === "object" && p.price !== null
            ? (p.price as any).value
            : Number(p.price);

        return {
          id: p.id,
          title: p.title,
          sku: p.sku,
          stockQuantity: p.stockQuantity,
          reorderLevel: 20, // Default reorder level
          price,
        };
      })
      .sort((a, b) => a.stockQuantity - b.stockQuantity);

    // Out of stock products
    const outOfStockProducts = products
      .filter((p) => p.stockQuantity === 0)
      .map((p) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        stockQuantity: 0,
        lastInStock: p.updatedAt.toISOString(), // Using updatedAt as proxy
      }));

    // Category breakdown
    const categoryMap = new Map<
      string,
      {
        name: string;
        totalProducts: number;
        totalStock: number;
        inventoryValue: number;
      }
    >();

    products.forEach((product) => {
      const catId = product.category.id;
      const catName = product.category.name;
      const existing = categoryMap.get(catId) || {
        name: catName,
        totalProducts: 0,
        totalStock: 0,
        inventoryValue: 0,
      };

      const price =
        typeof product.price === "object" && product.price !== null
          ? (product.price as any).value
          : Number(product.price);

      existing.totalProducts += 1;
      existing.totalStock += product.stockQuantity;
      existing.inventoryValue += price * product.stockQuantity;
      categoryMap.set(catId, existing);
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        name: data.name,
        totalProducts: data.totalProducts,
        totalStock: data.totalStock,
        inventoryValue: data.inventoryValue,
      }))
      .sort((a, b) => b.inventoryValue - a.inventoryValue);

    return successResponse({
      summary: {
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        totalInventoryValue,
      },
      lowStockAlerts,
      outOfStock: outOfStockProducts,
      categoryBreakdown,
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
