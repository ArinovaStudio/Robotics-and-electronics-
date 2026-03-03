import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import z from "zod";

export const updateAddressSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  addressLine1: z.string().min(5).optional(),
  addressLine2: z.string().nullable().optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().min(6).optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
  type: z.enum(["SHIPPING", "BILLING"]).optional(),
});

export async function PUT( req: NextRequest, { params }: { params: Promise<{ addressId: string }> }) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { addressId } = await params;
    const body = await req.json();
    const validation = updateAddressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const existingAddress = await prisma.address.findFirst({ where: { id: addressId, userId: user.id }});

    if (!existingAddress) {
      return NextResponse.json({ success: false, message: "Address not found" }, { status: 404 });
    }

    const updateData = validation.data;

    if (updateData.isDefault && !existingAddress.isDefault) {
        await prisma.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false }
        });
    }

    await prisma.address.update({ where: { id: addressId }, data: updateData });

    return NextResponse.json({ success: true, message: "Address updated successfully" });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE( req: NextRequest, { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { addressId } = await params;

    const existingAddress = await prisma.address.findFirst({ where: { id: addressId, userId: user.id }});

    if (!existingAddress) {
      return NextResponse.json({ success: false, message: "Address not found" }, { status: 404 });
    }

    const linkedOrdersCount = await prisma.order.count({ where: { addressId: addressId } });

    if (linkedOrdersCount > 0) {
      return NextResponse.json({ success: false,  message: "Cannot delete this address because it is linked to your past orders" }, { status: 400 });
    }

    await prisma.address.delete({ where: { id: addressId }});

    if (existingAddress.isDefault) {
      const nextAddress = await prisma.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" }});

      if (nextAddress) {
        await prisma.address.update({ where: { id: nextAddress.id }, data: { isDefault: true } });
      }
    }

    return NextResponse.json({ success: true, message: "Address deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}