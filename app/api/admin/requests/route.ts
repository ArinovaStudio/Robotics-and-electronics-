import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: Prisma.ProductRequestWhereInput = {};

    if (status) {
      where.status = status as any; 
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [
      requests, 
      filteredTotalItems, 
      totalCount, 
      pendingCount, 
      approvedCount, 
      rejectedCount
    ] = await Promise.all([
      prisma.productRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true, phone: true } },
        },
      }),
      prisma.productRequest.count({ where }), 
      prisma.productRequest.count({ where }), 
      prisma.productRequest.count({ where: { ...where, status: "PENDING" } }),
      prisma.productRequest.count({ where: { ...where, status: "APPROVED" } }),
      prisma.productRequest.count({ where: { ...where, status: "REJECTED" } }),
    ]);

    return NextResponse.json({ 
      success: true, 
      data: requests,
      counts: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      },
      pagination: {
        totalItems: filteredTotalItems,
        totalPages: Math.ceil(filteredTotalItems / limit),
        currentPage: page,
        limit,
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}