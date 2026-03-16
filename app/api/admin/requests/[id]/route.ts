import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { deleteFile } from "@/lib/upload";
import { getProductRequestUpdateTemplate } from "@/lib/templates";
import sendEmail from "@/lib/email";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, adminNotes } = body;

    const validStatuses = ["PENDING", "APPROVED", "AVAILABLE", "REJECTED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status provided" }, { status: 400 });
    }

    const existingRequest = await prisma.productRequest.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existingRequest) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    const updatedRequest = await prisma.productRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
      include: { user: { select: { name: true, email: true } } }
    });

    if (status && status !== existingRequest.status) {
        const emailHtml = getProductRequestUpdateTemplate(
            updatedRequest.user.name,
            updatedRequest.name,
            updatedRequest.status,
            adminNotes 
        );

        await sendEmail(updatedRequest.user.email, `Update on your product request: ${updatedRequest.name}`, emailHtml);
    }

    return NextResponse.json({ success: true, message: "Request updated successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingRequest = await prisma.productRequest.findUnique({ where: { id } });
    if (!existingRequest) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    if (existingRequest.image) {
      await deleteFile(existingRequest.image);
    }

    await prisma.productRequest.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Request deleted successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}