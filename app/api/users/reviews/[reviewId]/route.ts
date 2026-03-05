import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { deleteFile, uploadMultipleFiles } from "@/lib/upload";

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

export async function PUT( req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) {
  try {
    const user = await getUser();
    if (!user){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await params;
    const formData = await req.formData();

    const ratingStr = formData.get("rating") as string | null;
    const comment = formData.get("comment") as string | null;
    const existingImages = formData.getAll("existingImages") as string[]; 
    const newImageFiles = formData.getAll("newImages") as File[];

    const existingReview = await prisma.review.findFirst({ where: { id: reviewId, userId: user.id }});

    if (!existingReview) {
      return NextResponse.json({ success: false, message: "Review not found or unauthorized" }, { status: 404 });
    }

    const imagesToDelete = existingReview.images.filter(imgUrl => !existingImages.includes(imgUrl));

    for (const url of imagesToDelete) {
      await deleteFile(url);
    }

    let newImageUrls: string[] = [];
    if (newImageFiles && newImageFiles.length > 0) {
      const validFiles = newImageFiles.filter(file => file.size > 0);
      if (validFiles.length > 0) {
        const uploadedFiles = await uploadMultipleFiles(validFiles, "reviews");
        newImageUrls = uploadedFiles.map(file => file.path);
      }
    }

    const finalImages = [...existingImages, ...newImageUrls];

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: ratingStr ? parseInt(ratingStr) : existingReview.rating,
        comment: comment !== null ? comment : existingReview.comment,
        images: finalImages,
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

    if (existingReview.images && existingReview.images.length > 0) {
      for (const url of existingReview.images) {
        await deleteFile(url);
      }
    }

    await prisma.review.delete({ where: { id: reviewId } });

    return NextResponse.json({ success: true, message: "Review deleted successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}