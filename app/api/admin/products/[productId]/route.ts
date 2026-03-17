import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadFile, uploadMultipleFiles, deleteFile } from "@/lib/upload";
import z from "zod";
import { getAdminUser } from "@/lib/auth";

const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  link: z.string().min(1).optional(),
  imageLink: z.string().optional(),
  additionalImageLinks: z.array(z.string()).optional(),
  price: z.preprocess((val) => Number(val), z.number().nonnegative("Price cannot be negative")).optional(),
  salePrice: z.preprocess((val) => (val ? Number(val) : null), z.number().positive().nullable()).optional(),
  salePriceStartDate: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable()).optional(),
  salePriceEndDate: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable()).optional(),
  availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PREORDER", "BACKORDER"]).optional(),
  stockQuantity: z.preprocess((val) => Number(val), z.number().int().min(0)).optional(),
  sku: z.string().min(1).optional(),
  mpn: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  condition: z.enum(["NEW", "REFURBISHED", "USED"]).optional(),
  categoryId: z.string().min(1).optional(),
  isActive: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  isBundle: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  productDetails: z.array(z.any()).optional(),
  productHighlights: z.array(z.string()).optional(),
});

export async function PATCH( request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct){
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const link = formData.get("link") as string;
    const sku = formData.get("sku") as string;

    if (link || sku) {
      const check = await prisma.product.findFirst({
        where: {
          OR: [ ...(link ? [{ link }] : []), ...(sku ? [{ sku }] : []) ],
          NOT: { id: productId }
        }
      });
      if (check?.link === link) return NextResponse.json({ success: false, message: "Link already in use" }, { status: 400 });
      if (check?.sku === sku) return NextResponse.json({ success: false, message: "SKU already in use" }, { status: 400 });
    }

    const helperParseJson = (key: string, fallback: any) => {
      const val = formData.get(key);
      if (!val) return fallback;
      try { return JSON.parse(val as string); } catch { return fallback; }
    };

    const imagesToDelete = helperParseJson("imagesToDelete", []) as string[];
    let imageLink = existingProduct.imageLink;
    let additionalImageLinks = [...existingProduct.additionalImageLinks];

    if (imagesToDelete.length > 0) {
      for (const img of imagesToDelete) {
        await deleteFile(img).catch(() => {}); 
      }
      additionalImageLinks = additionalImageLinks.filter(img => !imagesToDelete.includes(img));
    }

    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {

      imageLink = await uploadFile(imageFile, "products");

      if (existingProduct.imageLink){
        await deleteFile(existingProduct.imageLink).catch(() => {});
      }
    }

    const additionalFiles = formData.getAll("additionalImages") as File[];

    const validAdditionalFiles = additionalFiles.filter(f => f.size > 0);

    if (validAdditionalFiles.length > 0) {
      const newLinks = (await uploadMultipleFiles(validAdditionalFiles, "products")).map(f => f.path);
      additionalImageLinks = [...additionalImageLinks, ...newLinks];
    }

    const payload: any = { imageLink, additionalImageLinks };
    
    const fields = [
      "title", "description", "link", "price", "salePrice", 
      "salePriceStartDate", "salePriceEndDate", "availability", 
      "stockQuantity", "sku", "mpn", "brand", "condition", 
      "categoryId", "productDetails", "productHighlights", 
      "isActive", "isBundle"
    ];

    fields.forEach(field => {
      if (formData.has(field)) {
          if (["productDetails", "productHighlights"].includes(field)) {
              payload[field] = helperParseJson(field, undefined);
          } else {
              payload[field] = formData.get(field);
          }
      }
    });

    const validation = updateProductSchema.safeParse(payload);
    if (!validation.success){
      return NextResponse.json({ success: false, message: validation.error.issues[0].message }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({ 
      where: { id: productId }, 
      data: validation.data 
    });

    return NextResponse.json({ success: true, message: "Product updated successfully", data: updatedProduct });

  } catch (e: any) {
    return NextResponse.json( { success: false, message: e.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE( request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin){
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product){
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const linkedOrders = await prisma.orderItem.findFirst({ where: { productId } });

    if (linkedOrders) {
      return NextResponse.json({ 
        success: false, 
        message: "Cannot delete product linked to existing orders. Please deactivate it instead." 
      }, { status: 400 });
    }

    await prisma.product.delete({ where: { id: productId } });

    const deletePromises: Promise<any>[] = [];

    if (product.imageLink){
      deletePromises.push(deleteFile(product.imageLink));
    }
    
    product.additionalImageLinks.forEach((imgUrl) => deletePromises.push(deleteFile(imgUrl)));
    
    await Promise.allSettled(deletePromises);

    return NextResponse.json({ success: true, message: "Product and images deleted successfully" });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}