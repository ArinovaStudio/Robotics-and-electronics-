import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().max(1000, "Comment is too long").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Validation Errors", error: validation.error.issues[0].message }, { status: 400 });
    }

    const { productId, rating, comment } = validation.data;

    const existingReview = await prisma.review.findUnique({ where: { userId_productId: { userId: user.id, productId } }});

    if (existingReview) {
      return NextResponse.json({ success: false, message: "Review already exists" }, { status: 400 });
    }

    const hasBought = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.id,
          status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] }
        }
      }
    });

    await prisma.review.create({
      data: {
        rating,
        comment,
        isVerifiedPurchase: !!hasBought,
        userId: user.id,
        productId,
      }
    });

    return NextResponse.json({ success: true, message: "Review created successfully" }, { status: 201 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}