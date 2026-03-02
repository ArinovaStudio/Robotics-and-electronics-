import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function GET(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await requireAdmin();
    const { productId } = await params;
    const faqs = await prisma.productFaq.findMany({ where: { productId }, orderBy: { order: "asc" } });
    return successResponse(faqs);
  } catch (error) {
    return errorResponse("Failed to fetch FAQs", 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await requireAdmin();
    const { productId } = await params;
    const { question, answer, order } = await request.json();
    if (!question || !answer) return errorResponse("Question and answer required", 400);
    const faq = await prisma.productFaq.create({ data: { productId, question, answer, order: order || 0 } });
    return successResponse(faq, 201);
  } catch (error: any) {
    console.error("FAQ creation error:", error);
    return errorResponse(error.message || "Failed to create FAQ", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await requireAdmin();
    const { id, question, answer, order } = await request.json();
    if (!id) return errorResponse("FAQ ID required", 400);
    const faq = await prisma.productFaq.update({ where: { id }, data: { question, answer, order } });
    return successResponse(faq);
  } catch (error) {
    return errorResponse("Failed to update FAQ", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("FAQ ID required", 400);
    await prisma.productFaq.delete({ where: { id } });
    return successResponse(null, "FAQ deleted");
  } catch (error) {
    return errorResponse("Failed to delete FAQ", 500);
  }
}
