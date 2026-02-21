import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { z } from "zod";
import { errorResponse } from "@/app/lib/api-response";

const exportQuerySchema = z.object({
  type: z.enum(["orders", "products", "customers"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(), // for orders
  availability: z.string().optional(), // for products
  isVerified: z.string().optional(), // for customers
});


function jsonToCsv(items: any[]) {
  if (!items || !items.length) return "No data available";
  
  const headers = Object.keys(items[0]);
  const csvRows = [
    headers.join(","), 
    ...items.map((row) =>
      headers
        .map((fieldName) => {
          let value = row[fieldName];
          if (value === null || value === undefined) value = "";
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(",")
    ),
  ];
  return csvRows.join("\r\n");
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());

    const validation = exportQuerySchema.safeParse(queryObject);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { type, startDate, endDate, status, availability, isVerified } = validation.data;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    let dataToExport: any[] = [];
    const filename = `${type}-export-${new Date().toISOString().split("T")[0]}.csv`;

    if (type === "orders") {
      const where: any = {};
      if (startDate || endDate) where.orderedAt = dateFilter;
      if (status && status !== "all") where.status = status;

      const orders = await prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          payment: { select: { status: true, paymentMethod: true } },
          _count: { select: { items: true } }
        },
        orderBy: { orderedAt: "desc" },
      });

      dataToExport = orders.map((o) => ({
        "Order ID": o.orderNumber,
        "Date": o.orderedAt.toISOString(),
        "Customer Name": o.user.name,
        "Customer Email": o.user.email,
        "Total Items": o._count.items,
        "Subtotal (INR)": o.subtotal,
        "Shipping (INR)": o.shippingCost,
        "Tax (INR)": o.taxAmount,
        "Discount (INR)": o.discount,
        "Total Amount (INR)": o.totalAmount,
        "Order Status": o.status,
        "Payment Status": o.payment?.status || "UNPAID",
        "Payment Method": o.payment?.paymentMethod || "N/A",
      }));
    }

    else if (type === "products") {
      const where: any = {};
      if (startDate || endDate) where.createdAt = dateFilter;
      if (availability && availability !== "all") where.availability = availability;

      const products = await prisma.product.findMany({
        where,
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });

      dataToExport = products.map((p) => ({
        "SKU": p.sku,
        "Product Name": p.title,
        "Category": p.category?.name || "Uncategorized",
        "Brand": p.brand || "N/A",
        "Stock Quantity": p.stockQuantity,
        "Availability": p.availability,
        "Condition": p.condition,
        "Regular Price (INR)": (p.price as any)?.value || 0,
        "Sale Price (INR)": (p.salePrice as any)?.value || "",
        "Active Status": p.isActive ? "Active" : "Hidden",
        "Is Bundle": p.isBundle ? "Yes" : "No",
        "Added On": p.createdAt.toISOString(),
      }));
    }

    else if (type === "customers") {
      const where: any = { role: "CUSTOMER" };
      if (startDate || endDate) where.createdAt = dateFilter;
      
      if (isVerified === "verified") where.emailVerified = { not: null };
      if (isVerified === "unverified") where.emailVerified = null;

      const customers = await prisma.user.findMany({
        where,
        include: { _count: { select: { orders: true } } },
        orderBy: { createdAt: "desc" },
      });

      dataToExport = customers.map((c) => ({
        "Customer ID": c.id,
        "Name": c.name,
        "Email": c.email,
        "Phone": c.phone || "N/A",
        "Verification Status": c.emailVerified ? "Verified" : "Unverified",
        "Total Orders": c._count.orders,
        "Joined On": c.createdAt.toISOString(),
      }));
    }

    const csvContent = jsonToCsv(dataToExport);
    
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}