import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadFile } from "@/lib/upload";
import { getUser } from "@/lib/auth"; 
import { getProductRequestUpdateTemplate } from "@/lib/templates";
import sendEmail from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const productUrl = formData.get("productUrl") as string | null;
    const brand = formData.get("brand") as string | null;
    const quantityStr = formData.get("quantity") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (!name || name.trim() === "") {
      return NextResponse.json({ success: false, message: "Product name is required" }, { status: 400 });
    }

    let imageLink = null;
    if (imageFile && imageFile.size > 0) {
      imageLink = await uploadFile(imageFile, "requests"); 
    }

    const newRequest = await prisma.productRequest.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        productUrl: productUrl?.trim() || null,
        brand: brand?.trim() || null,
        quantity: quantityStr ? parseInt(quantityStr, 10) : 1,
        image: imageLink,
      },
    });

    const emailHtml = getProductRequestUpdateTemplate( user.name, newRequest.name, "PENDING" );
    await sendEmail( user.email, `We received your product request: ${newRequest.name}`, emailHtml );

    return NextResponse.json({ success: true, message: "Product requested successfully", data: newRequest }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.productRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: requests }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}