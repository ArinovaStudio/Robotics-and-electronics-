import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = { userId: user.id };

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { items: { some: { product: { title: { contains: search, mode: "insensitive" } } } } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { title: true } } }},
        payment: { select: { status: true, paymentMethod: true } }
      }
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount).toFixed(2),
      itemCount: order.items.length,
      paymentStatus: order.payment?.status || "UNKNOWN",
      createdAt: order.createdAt,
      items: order.items.map(item => {
        const snapshot = (item.productSnapshot as any) || {};
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.priceAtPurchase),
          product: {
            id: item.productId,
            title: snapshot.title || item.product?.title || "Unknown Product",
            image: snapshot.image || null,
          }
        };
      })
    }));

    return NextResponse.json({ success: true, data: formattedOrders }, { status: 200 });

  } catch (error: any) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}