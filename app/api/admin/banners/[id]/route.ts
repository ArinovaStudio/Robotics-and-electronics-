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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.formData();
    const title = body.get("title") as string;
    const image = body.get("image") as any;
    if (!image) {
      throw Error("Image is Required");
    }
    if (!id) {
      throw Error("Id is Required");
    }
    const data: any = {};
    let Image = null;
    if(title){
      data.title=title;
    }
    if(image instanceof File){
      data.image = await uploadFile(image);
    }
    const banner = await prisma.banner.update({
      where:{
        id
      },  
      data: data
    });

    return NextResponse.json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error: any) {
    console.log(error.message);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    await prisma.banner.delete({
      where: { id: id },
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
