import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { uploadFile, uploadMultipleFiles } from "@/lib/upload";
import z from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || undefined;
    const availability = searchParams.get("availability") || undefined;
    const isActive = searchParams.get("isActive");
    const sort = searchParams.get("sort") || "relevance";

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
    }

    if (availability) where.availability = availability;
    if (isActive === "true") where.isActive = true;
    if (isActive === "false") where.isActive = false;

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
        inventoryValue += (Number(p.price) * p.stockQuantity);
    });

    return NextResponse.json({ 
      success: true, 
      message: "Products fetched successfully",
      data: {
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
            totalPages: Math.ceil(totalFiltered / limit) || 1
        }
      }
    });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

const createProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().min(1, "Link/slug is required"),
  imageLink: z.string().min(1, "Primary image is required"),
  additionalImageLinks: z.array(z.string()).optional().default([]),
  price: z.preprocess((val) => Number(val), z.number().positive("Price must be positive")),
  salePrice: z.preprocess((val) => (val ? Number(val) : null), z.number().positive().optional().nullable()),
  salePriceStartDate: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().optional().nullable()),
  salePriceEndDate: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().optional().nullable()),
  availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PREORDER", "BACKORDER"]).default("IN_STOCK"),
  stockQuantity: z.preprocess((val) => Number(val), z.number().int().min(0).default(0)),
  sku: z.string().min(1, "SKU is required"),
  mpn: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  condition: z.enum(["NEW", "REFURBISHED", "USED"]).default("NEW"),
  categoryId: z.string().min(1, "Category is required"),
  productDetails: z.array(z.any()).optional().default([]),
  productHighlights: z.array(z.string()).optional().default([]),
  customLabel0: z.string().optional().nullable(),
  customLabel1: z.string().optional().nullable(),
  isActive: z.preprocess((val) => val === "true" || val === true, z.boolean().default(true)),
  isBundle: z.preprocess((val) => val === "true" || val === true, z.boolean().default(false)),
});

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const sku = formData.get("sku") as string;
    const categoryId = formData.get("categoryId") as string;
    const link = (formData.get("link") as string) || title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const [category, existingProduct] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.product.findFirst({ where: { OR: [{ link }, { sku }] } }),
    ]);

    if (!category) return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    if (existingProduct?.link === link) return NextResponse.json({ success: false, message: "Link already exists" }, { status: 400 });
    if (existingProduct?.sku === sku) return NextResponse.json({ success: false, message: "SKU already exists" }, { status: 400 });

    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0){
      return NextResponse.json({ success: false, message: "Primary Image is required" }, { status: 400 });
    }

    const imageLink = await uploadFile(imageFile, "products");

    const additionalFiles = formData.getAll("additionalImages") as File[];
    const additionalImageLinks = additionalFiles.length > 0 
        ? (await uploadMultipleFiles(additionalFiles.filter(f => f.size > 0), "products")).map(f => f.path) 
        : [];

    const helperParseJson = (key: string, fallback: any) => {
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
      price: formData.get("price"),
      salePrice: formData.get("salePrice"),
      salePriceStartDate: formData.get("salePriceStartDate"),
      salePriceEndDate: formData.get("salePriceEndDate"),
      availability: formData.get("availability"),
      stockQuantity: formData.get("stockQuantity"),
      sku,
      mpn: formData.get("mpn"),
      brand: formData.get("brand"),
      condition: formData.get("condition"),
      categoryId,
      productDetails: helperParseJson("productDetails", []),
      productHighlights: helperParseJson("productHighlights", []),
      customLabel0: formData.get("customLabel0"),
      customLabel1: formData.get("customLabel1"),
      isActive: formData.get("isActive"),
      isBundle: formData.get("isBundle"),
    };

    const validation = createProductSchema.safeParse(payload);
    if (!validation.success){
      return NextResponse.json({ success: false, message: "validation error", error: validation.error.issues[0].message }, { status: 400 });
    }

    const product = await prisma.product.create({ data: validation.data });
    
    return NextResponse.json({ success: true, message: "Product created successfully.", data: product }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json( { success: false, message: e.message || "Internal server error" }, { status: 500 });
  }
}