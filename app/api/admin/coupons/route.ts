import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;

    const [coupons, totalCount, activeCount, inactiveCount] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.coupon.count(),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.coupon.count({ where: { isActive: false } })
    ]);

    return NextResponse.json({ 
      success: true, 
      data: {
        coupons,
        metrics: { total: totalCount, active: activeCount, inactive: inactiveCount }
      } 
    }, { status: 200 });
    
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase().trim(),
  description: z.string().optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.preprocess((val) => Number(val), z.number().positive("Discount value must be greater than 0")),
  minOrderAmount: z.preprocess((val) => (val ? Number(val) : null), z.number().nonnegative().optional().nullable()),
  maxDiscountAmount: z.preprocess((val) => (val ? Number(val) : null), z.number().nonnegative().optional().nullable()),
  usageLimit: z.preprocess((val) => (val ? Number(val) : null), z.number().int().positive().optional().nullable()),
  isActive: z.boolean().default(true),
  startDate: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().optional().nullable()),
  expiryDate: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().optional().nullable()),
});

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    const validation = couponSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const { code } = validation.data;

    const existingCoupon = await prisma.coupon.findUnique({ where: { code } });
    if (existingCoupon) {
      return NextResponse.json({ success: false, message: "Coupon code already exists!" }, { status: 400 });
    }

    await prisma.coupon.create({ data: validation.data });

    return NextResponse.json({ success: true, message: "Coupon created successfully" }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}