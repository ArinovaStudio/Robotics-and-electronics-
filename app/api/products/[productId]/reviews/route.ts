import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET( req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const sort = searchParams.get("sort") || "latest"; // latest / highest / lowest

    let orderBy: any = { createdAt: "desc" };
    if (sort === "highest") orderBy = { rating: "desc" };
    if (sort === "lowest") orderBy = { rating: "asc" };

    const [reviews, totalCount, aggregations] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: { name: true, image: true }
          }
        }
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.aggregate({ where: { productId }, _avg: { rating: true } })
    ]);

    const formattedReviews = reviews.map((r) => {
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        createdAt: r.createdAt,
        user: { name: r.user?.name, image: r.user?.image }
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        total: totalCount,
        averageRating: aggregations._avg.rating ? Number(aggregations._avg.rating.toFixed(1)) : 0,
        page,
        totalPages: Math.ceil(totalCount / limit) || 1
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}