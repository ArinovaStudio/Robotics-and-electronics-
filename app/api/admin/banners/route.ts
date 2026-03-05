import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany();

    return NextResponse.json({
      success: true,
      message: "Banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch banners",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.formData();
    const title = body.get("title") as string;
    const image = body.get("image") as File || null;
    if(!image){
      throw Error("Image is Required");
    }
    const ImageUrl = await uploadFile(image);
    const banner = await prisma.banner.create({
      data: {
        title: title,
        image: ImageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create banner",
        data: null,
      },
      { status: 500 }
    );
  }
}
