import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { z } from "zod";

const updateCouponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase().trim().optional(),
  description: z.string().optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional(),
  discountValue: z.preprocess((val) => (val ? Number(val) : undefined), z.number().positive().optional()),
  minOrderAmount: z.preprocess((val) => (val ? Number(val) : null), z.number().nonnegative().optional().nullable()),
  maxDiscountAmount: z.preprocess((val) => (val ? Number(val) : null), z.number().nonnegative().optional().nullable()),
  usageLimit: z.preprocess((val) => (val ? Number(val) : null), z.number().int().positive().optional().nullable()),
  isActive: z.boolean().optional(),
  startDate: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().optional().nullable()),
  expiryDate: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().optional().nullable()),
});


export async function PUT(req: Request, { params }: { params: Promise<{ couponId: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { couponId } = await params;
    const body = await req.json();

    const validation = updateCouponSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const updateData = validation.data;

    if (updateData.code) {
      const existingCoupon = await prisma.coupon.findUnique({ where: { code: updateData.code } });
      if (existingCoupon && existingCoupon.id !== couponId) {
        return NextResponse.json({ success: false, message: "This coupon code is already being used." }, { status: 400 });
      }
    }

    await prisma.coupon.update({
      where: { id: couponId },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: "Coupon updated successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ couponId: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { couponId } = await params;

    const existingCoupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!existingCoupon) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id: couponId } });

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}