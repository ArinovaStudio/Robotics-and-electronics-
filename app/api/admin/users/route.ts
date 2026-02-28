import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { getAdminUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const verified = searchParams.get("verified");
    const sort = searchParams.get("sort") || "newest";

    const skip = (page - 1) * limit;

    const where: any = { role: { not: "ADMIN" } };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) where.role = role;

    if (verified === "true") where.emailVerified = { not: null };
    if (verified === "false") where.emailVerified = null;

    let orderBy: any = { createdAt: "desc" };
    if (sort === "alphabetical") orderBy = { name: "asc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };

    const [users, totalFiltered, totalCustomers, verifiedCustomers] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          phone: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "CUSTOMER", emailVerified: { not: null } } })
    ]);

    const usersWithSpent = await Promise.all(
      users.map(async (u) => {
        const spentData = await prisma.order.aggregate({
          where: {
            userId: u.id,
            status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
          },
          _sum: { totalAmount: true },
        });

        return {
          ...u,
          totalSpent: Number(spentData._sum.totalAmount || 0).toFixed(2),
          orderCount: u._count.orders,
        };
      })
    );

    if (sort === "orders") {
      usersWithSpent.sort((a, b) => b.orderCount - a.orderCount);
    }

    const totalPages = Math.ceil(totalFiltered / limit) || 1;

    return NextResponse.json({
      success: true,
      message: "Customers fetched successfully",
      data: {
        users: usersWithSpent,
        metrics: {
          totalCustomers,
          verifiedCustomers,
          unverifiedCustomers: totalCustomers - verifiedCustomers,
        },
        pagination: {
          page,
          limit,
          total: totalFiltered,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}