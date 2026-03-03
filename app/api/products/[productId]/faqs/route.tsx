import { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    await getAdminUser();
    const { productId } = await params;
    const faqs = await prisma.productFaq.findMany({ where: { productId }, orderBy: { order: "asc" } });
    return successResponse(faqs);
  } catch (error) {
    return errorResponse("Failed to fetch FAQs", 500);
  }
}