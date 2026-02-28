import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getAdminUser } from "@/lib/auth";

export async function GET( req: NextRequest, { params }: { params: Promise<{ userId: string }> } ) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: { orderBy: { createdAt: "desc" } },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            orderedAt: true,
            payment: {
              select: {
                status: true,
                paymentMethod: true,
              },
            },
            _count: {
              select: { items: true },
            },
          },
          orderBy: { orderedAt: "desc" },
          take: 20,
        },
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json( { success: false, message: "User not found" }, { status: 404 });
    }

    const totalSpentData = await prisma.order.aggregate({
      where: {
        userId: user.id,
        status: {
          in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const formattedOrders = user.orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount).toFixed(2),
      itemCount: order._count.items,
    }));

    const userDetails = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      phone: user.phone,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      addresses: user.addresses,
      orderHistory: formattedOrders,
      metrics: {
        orderCount: user._count.orders,
        addressCount: user._count.addresses,
        totalSpent: Number(totalSpentData._sum.totalAmount || 0).toFixed(2),
      },
    };

    return NextResponse.json({ success: true, data: userDetails });

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}