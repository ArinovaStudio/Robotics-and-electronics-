import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ couponId: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { couponId } = await params;
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    const existingCoupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!existingCoupon) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }


    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: isActive },
    });

    return NextResponse.json({ success: true, message: "Coupon status updated successfully." }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}