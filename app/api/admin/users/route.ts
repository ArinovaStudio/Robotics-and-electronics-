import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { adminListUsersQuerySchema } from "@/app/lib/validations/admin-user";

// GET /api/admin/users - List all users with filters
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());

    const validation = adminListUsersQuerySchema.safeParse(queryObject);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { page, limit, search, role, verified, sort } = validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { id: { not: user.id }, role: { not: "ADMIN" } };

    // Search in name and email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Filter by email verification status
    if (verified !== undefined) {
      if (verified) {
        where.emailVerified = { not: null };
      } else {
        where.emailVerified = null;
      }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "alphabetical":
        orderBy = { name: "asc" };
        break;
      case "orders":
        // For orders sort, we need to use aggregation, will handle separately
        orderBy = { createdAt: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    // Fetch users and total count
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
        orderBy: sort === "orders" ? undefined : orderBy, // Handled post-fetch if "orders"
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: { not: "ADMIN" } } }), // Global Total
      prisma.user.count({ where: { role: { not: "ADMIN" }, emailVerified: { not: null } } }) // Global Verified
    ]);

    // Calculate totalSpent for each user in parallel
    const usersWithSpent = await Promise.all(
      users.map(async (user) => {
        const ordersTotal = await prisma.order.aggregate({
          where: {
            userId: user.id,
            status: {
              in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
            },
          },
          _sum: {
            totalAmount: true,
          },
        });

        return {
          ...user,
          totalSpent: ordersTotal._sum.totalAmount || 0,
        };
      }),
    );

    // Sort by orders count if requested
    if (sort === "orders") {
      usersWithSpent.sort((a, b) => b._count.orders - a._count.orders);
    }

    const totalPages = Math.ceil(totalFiltered / limit) || 1;

    return successResponse({
      users: usersWithSpent,
      metrics: {
        totalCustomers,
        verifiedCustomers,
        unverifiedCustomers: totalCustomers - verifiedCustomers
      },
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error: any) {
    return (
      error.response ||
      new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500 },
      )
    );
  }
}
