import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { code, cartTotal } = await request.json();

    if (!code || !cartTotal) {
      return NextResponse.json({ success: false, message: "Code and Cart Total are required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, message: "Invalid coupon code" }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return NextResponse.json({ success: false, message: "This coupon is not active yet" }, { status: 400 });
    }
    if (coupon.expiryDate && now > coupon.expiryDate) {
      return NextResponse.json({ success: false, message: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, message: "This coupon has reached its usage limit" }, { status: 400 });
    }

    if (coupon.minOrderAmount && Number(cartTotal) < Number(coupon.minOrderAmount)) {
      return NextResponse.json({ success: false, message: `Minimum order of ₹${coupon.minOrderAmount} required` }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Number(cartTotal) * (Number(coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
      }
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    discountAmount = Math.min(discountAmount, Number(cartTotal));

    return NextResponse.json({ 
      success: true, 
      message: "Coupon applied successfully!",
      data: { discountAmount, code: coupon.code }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}