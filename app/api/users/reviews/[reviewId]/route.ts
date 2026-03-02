import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

export async function GET( req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await params;

    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId: user.id },
      include: {
        product: { select: { id: true, title: true, imageLink: true } }
      }
    });

    if (!review) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: review }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export async function PUT( req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await params;
    const body = await req.json();
    
    const validation = updateReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const { rating, comment } = validation.data;

    const existingReview = await prisma.review.findFirst({ where: { id: reviewId, userId: user.id }});

    if (!existingReview) {
      return NextResponse.json({ success: false, message: "Review not found or unauthorized" }, { status: 404 });
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating !== undefined ? rating : existingReview.rating,
        comment: comment !== undefined ? comment : existingReview.comment,
      }
    });

    return NextResponse.json({ success: true, message: "Review updated successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE( req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await params;

    const existingReview = await prisma.review.findFirst({ where: { id: reviewId, userId: user.id }});

    if (!existingReview) {
      return NextResponse.json({ success: false, message: "Review not found or unauthorized" }, { status: 404 });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    return NextResponse.json({ success: true, message: "Review deleted successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}