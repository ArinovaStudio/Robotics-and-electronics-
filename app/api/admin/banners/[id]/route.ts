import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await prisma.banner.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Banner fetched successfully",
      data: banner,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch banner",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.json();

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title: body.title,
        image: body.image,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update banner",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    await prisma.banner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
      data: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete banner",
        data: null,
      },
      { status: 500 }
    );
  }
}
