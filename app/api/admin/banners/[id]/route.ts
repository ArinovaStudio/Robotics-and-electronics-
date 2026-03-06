import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { deleteFile, uploadFile } from "@/lib/upload";

export async function GET( req: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {
    const { id: bannerId } = await params;

    const banner = await prisma.banner.findUnique({ where: { id: bannerId } });

    if (!banner) {
      return NextResponse.json( { success: false, message: "Banner not found" }, { status: 404 } );
    }

    return NextResponse.json({ success: true, message: "Banner fetched successfully", data: banner });

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT( req: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {
    const {id} = await params;

    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json( { success: false, message: "Unauthorized" }, { status: 401 } );
    }

    const body = await req.formData();
    const title = body.get("title") as string;
    const image = body.get("image") as any;

    const existingBanner = await prisma.banner.findUnique({ where: { id } });
    if (!existingBanner) {
      return NextResponse.json( { success: false, message: "Banner not found" }, { status: 404 } );
    }


    if (!image) {
      throw Error("Image is Required");
    }
    if (!id) {
      throw Error("Id is Required");
    }

    const data: any = {};

    if(title){
      data.title=title;
    }
    if(image instanceof File){
      data.image = await uploadFile(image, "banners");

      if (existingBanner.image) {
        await deleteFile(existingBanner.image);
      }
    }
    const banner = await prisma.banner.update({
      where:{ id },  
      data: data
    });

    return NextResponse.json({ success: true, message: "Banner updated successfully", data: banner }, { status: 200 });
  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE( req: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {
    const { id } = await params;

    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json( { success: false, message: "Unauthorized" }, { status: 401 });
    }

    const existingBanner = await prisma.banner.findUnique({ where: { id } });
    if (!existingBanner) {
      return NextResponse.json( { success: false, message: "Banner not found" }, { status: 404 } );
    }


    await prisma.banner.delete({ where: { id: id } });

    if (existingBanner.image) {
      await deleteFile(existingBanner.image);
    }

    return NextResponse.json({ success: true, message: "Banner deleted successfully" }, { status: 200 });
    
  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}
