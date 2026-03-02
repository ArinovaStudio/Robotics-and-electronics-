import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

export async function GET( req: NextRequest, { params }: { params: Promise<{ productId: string }> } ) {
  try {
    const { productId } = await params;
    
    const faqs = await prisma.productFaq.findMany({ 
      where: { productId }, 
      orderBy: { order: "asc" } 
    });

    return NextResponse.json({ success: true, data: faqs }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST( req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    const { productId } = await params;
    const { question, answer, order } = await req.json();

    if (!question || !answer) {
      return NextResponse.json({ success: false, message: "Question and answer are required" }, { status: 400 });
    }

    const faq = await prisma.productFaq.create({ 
      data: { 
        productId, 
        question, 
        answer, 
        order: order || 0 
      } 
    });

    return NextResponse.json({ success: true, message: "FAQ created successfully", data: faq }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH( req: NextRequest ) {
  try {
    const admin = await getAdminUser();
    if (!admin){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    const { id, question, answer, order } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "FAQ ID is required" }, { status: 400 });
    }

    const faq = await prisma.productFaq.update({ 
      where: { id }, 
      data: { question, answer, order } 
    });

    return NextResponse.json({ success: true, message: "FAQ updated successfully", data: faq }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE( req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "FAQ ID is required" }, { status: 400 });
    }

    await prisma.productFaq.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "FAQ deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete FAQ" }, { status: 500 });
  }
}