import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";

// GET /api/admin/users/[userId] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    await requireAdmin();

    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: {
            createdAt: "desc",
          },
        },
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
              select: {
                items: true,
              },
            },
          },
          orderBy: {
            orderedAt: "desc",
          },
          take: 20, // Last 20 orders
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
      return errorResponse("User not found", 404);
    }

    // Calculate total spent
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

    // Format orders for response
    const formattedOrders = user.orders.map((order) => ({
      ...order,
      totalAmount: order.totalAmount.toString(),
      itemCount: order._count.items,
    }));

    // Format user response
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
      orders: formattedOrders,
      _count: user._count,
      totalSpent: totalSpentData._sum.totalAmount || 0,
    };

    return successResponse(userDetails);
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
