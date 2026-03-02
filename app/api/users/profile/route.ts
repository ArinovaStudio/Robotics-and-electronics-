import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        orders: { select: { totalAmount: true } },
        addresses: { orderBy: [ { isDefault: "desc" }, { createdAt: "desc" } ] }
      }
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const totalOrders = existingUser.orders.length;
    const totalSpent = existingUser.orders.reduce((sum, order) => {
      const amount = Number(order.totalAmount || 0);
      return sum + amount;
    }, 0);

    return NextResponse.json({
        success: true,
        user: {
            name: existingUser.name || "",
            email: existingUser.email,
            phone: existingUser.phone || "",
        },
        stats: { totalOrders, totalSpent: totalSpent.toFixed(2),
        },
        addresses: existingUser.addresses
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
});

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const { name, phone } = validation.data;

    await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim(), phone: phone || null }
    });

    return NextResponse.json({ success: true, message: "Profile updated successfully" }, { status: 200 });
 
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}