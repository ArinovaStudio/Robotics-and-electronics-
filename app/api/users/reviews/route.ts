import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { uploadMultipleFiles } from "@/lib/upload";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const productId = request.nextUrl.searchParams.get("productId");

    const reviews = await prisma.review.findMany({
      where: { 
        userId: user.id,
        ...(productId ? { productId } : {}) 
      },
      orderBy: { createdAt: "desc" },
      include: { 
        product: { select: { id: true, title: true, imageLink: true } },
        user: { select: { name: true } }
       }
    });

    return NextResponse.json({ success: true, data: { reviews } }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const ratingStr = formData.get("rating") as string;
    const comment = formData.get("comment") as string | null;
    const imageFiles = formData.getAll("images") as File[];

    if (!productId || !ratingStr) {
      return NextResponse.json({ success: false, message: "Product ID and rating are required" }, { status: 400 });
    }

    const rating = parseInt(ratingStr, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Rating must be a number between 1 and 5" }, { status: 400 });
    }

    const userReviewCount = await prisma.review.count({ where: { userId: user.id, productId } });
    if (userReviewCount >= 3) {
      return NextResponse.json({ success: false, message: "You have reached the maximum limit of 3 reviews" }, { status: 400 });
    }

    const hasBought = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.id,
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] }
        }
      }
    });

    let imageUrls: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      try {
        const validFiles = imageFiles.filter((file: any) => file.size > 0);
        
        if (validFiles.length > 0) {
          const uploadedFiles = await uploadMultipleFiles(validFiles, "reviews");
          imageUrls = uploadedFiles.map((file: any) => file.path);
        }
      } catch {
        return NextResponse.json({ success: false, message: "Failed to upload images" }, { status: 400 });
      }
    }

    await prisma.review.create({
      data: {
        rating,
        comment,
        images: imageUrls,
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