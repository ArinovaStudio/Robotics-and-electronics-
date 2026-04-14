import { NextRequest, NextResponse } from "next/server";
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

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json( { success: false, message: "Unauthorized" }, { status: 401 } );
    }

    const body = await req.formData();
    const title = body.get("title") as string;
    const image = body.get("image") as File || null;
    const link = body.get("link") as string | null;

    if(!image){
      return NextResponse.json( { success: false, message: "Image is Required" }, { status: 400 } );
    }
    
    if(!title){
      return NextResponse.json( { success: false, message: "Title is Required" }, { status: 400 } );
    }

    const ImageUrl = await uploadFile(image, "banners");

    const banner = await prisma.banner.create({
      data: {
        title: title,
        image: ImageUrl,
        link: link || null
      },
    });

    return NextResponse.json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });

  } catch (e: any) {
    return NextResponse.json( { success: false, message: e.message || "Internal server error" }, { status: 500 });
  }
}
