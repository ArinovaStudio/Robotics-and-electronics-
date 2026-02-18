import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = Math.min(parseInt(searchParams.get("limit") || "8"), 50);
    const type = searchParams.get("type") || "all";

    const result: any = {};

    // Get bestsellers (highest stock quantity as proxy for popularity)
    if (type === "all" || type === "bestsellers") {
      const bestsellers = await prisma.product.findMany({
        where: { isActive: true, availability: "IN_STOCK" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { stockQuantity: "desc" },
        take: limit,
      });

      result.bestsellers = bestsellers.map((product: any) => ({
        id: product.id,
        title: product.title,
        link: product.link,
        imageLink: product.imageLink,
        price: product.price,
        salePrice: product.salePrice,
        availability: product.availability,
        brand: product.brand,
        condition: product.condition,
        category: product.category,
        stockQuantity: product.stockQuantity,
      }));
    }

    // Get new arrivals (most recent products)
    if (type === "all" || type === "new_arrivals") {
      const newArrivals = await prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      result.newArrivals = newArrivals.map((product: any) => ({
        id: product.id,
        title: product.title,
        link: product.link,
        imageLink: product.imageLink,
        price: product.price,
        salePrice: product.salePrice,
        availability: product.availability,
        brand: product.brand,
        condition: product.condition,
        category: product.category,
        stockQuantity: product.stockQuantity,
      }));
    }

    // Get products on sale (salePrice exists and is active)
    if (type === "all" || type === "on_sale") {
      const allProducts = await prisma.product.findMany({
        where: {
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Filter products with salePrice
      const onSaleProducts = allProducts
        .filter((product: any) => product.salePrice !== null)
        .slice(0, limit);

      result.onSale = onSaleProducts.map((product: any) => ({
        id: product.id,
        title: product.title,
        link: product.link,
        imageLink: product.imageLink,
        price: product.price,
        salePrice: product.salePrice,
        availability: product.availability,
        brand: product.brand,
        condition: product.condition,
        category: product.category,
        stockQuantity: product.stockQuantity,
      }));
    }

    // Get trending products (using customLabel0 = "trending" as marker)
    if (type === "all" || type === "trending") {
      const trendingProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [{ customLabel0: "trending" }, { customLabel1: "trending" }],
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      // If no trending products found, fallback to recent popular products
      if (trendingProducts.length === 0) {
        const fallbackTrending = await prisma.product.findMany({
          where: { isActive: true, availability: "IN_STOCK" },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { stockQuantity: "desc" },
          take: limit,
        });

        result.trending = fallbackTrending.map((product: any) => ({
          id: product.id,
          title: product.title,
          link: product.link,
          imageLink: product.imageLink,
          price: product.price,
          salePrice: product.salePrice,
          availability: product.availability,
          brand: product.brand,
          condition: product.condition,
          category: product.category,
          stockQuantity: product.stockQuantity,
        }));
      } else {
        result.trending = trendingProducts.map((product: any) => ({
          id: product.id,
          title: product.title,
          link: product.link,
          imageLink: product.imageLink,
          price: product.price,
          salePrice: product.salePrice,
          availability: product.availability,
          brand: product.brand,
          condition: product.condition,
          category: product.category,
          stockQuantity: product.stockQuantity,
        }));
      }
    }

    return successResponse(result);
  } catch (error) {
    console.error("Get featured products error:", error);
    return errorResponse("Internal server error", 500);
  }
}
