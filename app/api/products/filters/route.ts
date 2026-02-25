import prisma from "@/app/lib/db";
import { successResponse, errorResponse } from "@/app/lib/api-response";

export async function GET() {
  try {
    // 1. Fetch active categories with product counts
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { sortOrder: "asc" },
    });

    const formattedCategories = categories
      .filter((c) => c._count.products > 0)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      }));

    // 2. Get price range from all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { price: true, salePrice: true },
    });

    let minPrice = 0;
    let maxPrice = 10000;

    if (products.length > 0) {
      const prices = products.map((p: any) => {
        const sale = p.salePrice?.value;
        const regular = p.price?.value || 0;
        return sale && sale < regular ? sale : regular;
      });
      minPrice = Math.floor(Math.min(...prices));
      maxPrice = Math.ceil(Math.max(...prices));
    }

    // 3. Compute available discount ranges from real data
    const discountSet = new Set<string>();
    products.forEach((p: any) => {
      const regular = p.price?.value || 0;
      const sale = p.salePrice?.value;
      if (sale && regular > sale) {
        const pct = Math.round(((regular - sale) / regular) * 100);
        // Bucket into 10% ranges
        const bucket = Math.floor(pct / 10) * 10;
        if (bucket >= 10) {
          discountSet.add(`${bucket}% OFF`);
        }
      }
    });

    const discounts = Array.from(discountSet).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
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
