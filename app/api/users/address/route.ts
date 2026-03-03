import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import z from "zod";

export async function GET() {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [ { isDefault: "desc" }, { createdAt: "desc" } ]
    });

    return NextResponse.json({ success: true, data: addresses }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  addressLine1: z.string().min(5, "Address Line 1 is required"),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid Pincode is required"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
  type: z.enum(["SHIPPING", "BILLING"]).default("SHIPPING"),
});


export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = addressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const addressData = validation.data;

    const existingCount = await prisma.address.count({ where: { userId: user.id } });

    if (existingCount === 0) {
      addressData.isDefault = true;
    }

    if (addressData.isDefault && existingCount > 0) {
        await prisma.address.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } });
    } 
    
    await prisma.address.create({ data: { ...addressData, userId: user.id } });

    return NextResponse.json({ success: true, message: "Address added successfully" }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}