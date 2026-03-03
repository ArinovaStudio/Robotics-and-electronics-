import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function GET() {
  try {
    // 1. Fetch active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        products: {
          where: { isActive: true },
          select: { id: true }
        }
      },
      orderBy: { sortOrder: "asc" },
    });

    const formattedCategories = categories
      .filter((c) => c.products.length > 0)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c.products.length,
      }));

    // 2. Get all active product prices
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { price: true, salePrice: true },
    });

    let minPrice = 0;
    let maxPrice = 10000;

    if (products.length > 0) {
      const prices = products.map((p) => {
        const regular = Number(p.price);
        const sale = p.salePrice ? Number(p.salePrice) : null;

        return sale && sale < regular ? sale : regular;
      });

      minPrice = Math.floor(Math.min(...prices));
      maxPrice = Math.ceil(Math.max(...prices));
    }

    // 3. Discount buckets
    const discountSet = new Set<string>();

    products.forEach((p) => {
      const regular = Number(p.price);
      const sale = p.salePrice ? Number(p.salePrice) : null;

      if (sale && sale < regular) {
        const pct = Math.round(((regular - sale) / regular) * 100);
        const bucket = Math.floor(pct / 10) * 10;
        if (bucket >= 10) discountSet.add(`${bucket}% OFF`);
      }
    });

    const discounts = Array.from(discountSet).sort((a, b) => {
      return parseInt(a) - parseInt(b);
    });

    return successResponse({
      categories: formattedCategories,
      priceRange: { min: minPrice, max: maxPrice },
      discounts,
    });

  } catch (error) {
    console.error("Product filters error:", error);
    return errorResponse("Internal server error", 500);
  }
}