import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { uploadFile, uploadMultipleFiles } from "@/app/lib/upload";
import { adminListProductsQuerySchema, createProductSchema } from "@/app/lib/validations/admin-product";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());

    const validation = adminListProductsQuerySchema.safeParse(queryObject);
    if (!validation.success) return errorResponse(validation.error.issues[0].message, 400);

    const { page, limit, search, category, availability, isActive, sort } = validation.data;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) {
      const categoryRecord = await prisma.category.findUnique({ where: { slug: category }, select: { id: true } });
      if (categoryRecord) where.categoryId = categoryRecord.id;
      else return successResponse({ products: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }
    if (availability) where.availability = availability;
    if (isActive !== undefined) where.isActive = isActive;

    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "price_asc": orderBy = { price: "asc" }; break;
      case "price_desc": orderBy = { price: "desc" }; break;
      case "title_asc": orderBy = { title: "asc" }; break;
      case "stock_asc": orderBy = { stockQuantity: "asc" }; break;
      case "stock_desc": orderBy = { stockQuantity: "desc" }; break;
    }

    const [products, totalFiltered, allProductsForMetrics] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        skip, take: limit, orderBy,
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({ select: { stockQuantity: true, price: true, isActive: true } }) 
    ]);

    let inventoryValue = 0;
    let lowStockCount = 0;
    
    allProductsForMetrics.forEach(p => {
        if (p.isActive && p.stockQuantity < 5) lowStockCount++;
        const priceVal = (p.price as any)?.value || 0;
        inventoryValue += (priceVal * p.stockQuantity);
    });

    return successResponse({
      products,
      metrics: {
          totalProducts: allProductsForMetrics.length,
          lowStockItems: lowStockCount,
          inventoryValue: inventoryValue
      },
      pagination: { 
          page, 
          limit, 
          total: totalFiltered, 
          totalPages: Math.ceil(totalFiltered / limit) 
      },
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}


export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const sku = formData.get("sku") as string;
    const categoryId = formData.get("categoryId") as string;
    const link = (formData.get("link") as string) || title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const [category, existingProduct] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.product.findFirst({ where: { OR: [{ link }, { sku }] } }),
    ]);

    if (!category) return errorResponse("Category not found", 404);
    if (existingProduct?.link === link) return errorResponse("Product with this link/slug already exists", 400);
    if (existingProduct?.sku === sku) return errorResponse("Product with this SKU already exists", 400);

    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) return errorResponse("Primary image is required", 400);
    const imageLink = await uploadFile(imageFile, "products");

    const additionalFiles = formData.getAll("additionalImages") as File[];
    const validAdditionalFiles = additionalFiles.filter(f => f.size > 0);
    const additionalImageLinks = validAdditionalFiles.length > 0 
        ? (await uploadMultipleFiles(validAdditionalFiles, "products")).map(f => f.path) 
        : [];

    const parseJson = (key: string, fallback: any) => {
      const val = formData.get(key);
      if (!val) return fallback;
      try { return JSON.parse(val as string); } catch { return fallback; }
    };

    const payload = {
      title,
      description: formData.get("description"),
      link,
      imageLink,
      additionalImageLinks,
      price: parseJson("price", undefined),
      salePrice: parseJson("salePrice", null),
      salePriceEffectiveDate: parseJson("salePriceEffectiveDate", null),
      availability: formData.get("availability") || "IN_STOCK",
      stockQuantity: parseInt((formData.get("stockQuantity") as string) || "0"),
      sku,
      mpn: formData.get("mpn") || null,
      brand: formData.get("brand") || null,
      condition: formData.get("condition") || "NEW",
      categoryId,
      productDetails: parseJson("productDetails", []),
      productHighlights: parseJson("productHighlights", []),
      customLabel0: formData.get("customLabel0") || null,
      customLabel1: formData.get("customLabel1") || null,
      isActive: formData.get("isActive") === "true",
      isBundle: formData.get("isBundle") === "true",
    };

    const validation = createProductSchema.safeParse(payload);
    if (!validation.success) return errorResponse(validation.error.issues[0].message, 400);

    const product = await prisma.product.create({ data: validation.data });
    
    return successResponse(product, "Product created successfully.", 201);
  } catch  {
    return errorResponse("Internal server error", 500);
  }
}