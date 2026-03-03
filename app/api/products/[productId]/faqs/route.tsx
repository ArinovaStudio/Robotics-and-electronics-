<<<<<<< HEAD
import { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
=======
import { NextRequest, NextResponse } from "next/server";
>>>>>>> 7c8d82970746956901a98d7f02e3e3fc5155170f
import prisma from "@/lib/prisma";

export async function GET( req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
<<<<<<< HEAD
    await getAdminUser();
=======
>>>>>>> 7c8d82970746956901a98d7f02e3e3fc5155170f
    const { productId } = await params;

    const faqs = await prisma.productFaq.findMany({
      where: { productId },
      orderBy: { order: "asc" }
    });

    return NextResponse.json({ success: true, data: faqs }, { status: 200 });
  } catch  {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}