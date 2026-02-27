import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { uploadFile, uploadMultipleFiles, deleteFile } from "@/app/lib/upload";
import { updateProductSchema } from "@/app/lib/validations/admin-product";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    await requireAdmin();
    const { productId } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) return errorResponse("Product not found", 404);

    const formData = await request.formData();

    const link = formData.get("link") as string;
    const sku = formData.get("sku") as string;

    if (link || sku) {
      const check = await prisma.product.findFirst({
        where: {
          OR: [...(link ? [{ link }] : []), ...(sku ? [{ sku }] : [])],
          NOT: { id: productId },
        },
      });
      if (check?.link === link)
        return errorResponse("Product with this link already exists", 400);
      if (check?.sku === sku)
        return errorResponse("Product with this SKU already exists", 400);
    }

    const parseJson = (key: string, fallback: any) => {
      const val = formData.get(key);
      if (!val) return fallback;
      try {
        return JSON.parse(val as string);
      } catch {
        return fallback;
      }
    };
    const imagesToDelete = parseJson("imagesToDelete", []) as string[];

    let imageLink = existingProduct.imageLink;
    let additionalImageLinks = [...existingProduct.additionalImageLinks];

    if (imagesToDelete.length > 0) {
      for (const img of imagesToDelete) {
        await deleteFile(img).catch(() => {});
      }
      additionalImageLinks = additionalImageLinks.filter(
        (img) => !imagesToDelete.includes(img),
      );
    }

    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      imageLink = await uploadFile(imageFile, "products");
      if (existingProduct.imageLink)
        await deleteFile(existingProduct.imageLink).catch(() => {});
    }

    const additionalFiles = formData.getAll("additionalImages") as File[];
    const validAdditionalFiles = additionalFiles.filter((f) => f.size > 0);
    if (validAdditionalFiles.length > 0) {
      const newLinks = (
        await uploadMultipleFiles(validAdditionalFiles, "products")
      ).map((f) => f.path);
      additionalImageLinks = [...additionalImageLinks, ...newLinks];
    }

    const payload: any = { imageLink, additionalImageLinks };
    if (formData.has("title")) payload.title = formData.get("title");
    if (formData.has("description"))
      payload.description = formData.get("description");
    if (formData.has("link")) payload.link = link;
    if (formData.has("price")) payload.price = parseJson("price", undefined);
    if (formData.has("salePrice"))
      payload.salePrice = parseJson("salePrice", null);
    if (formData.has("salePriceEffectiveDate"))
      payload.salePriceEffectiveDate = parseJson(
        "salePriceEffectiveDate",
        null,
      );
    if (formData.has("availability"))
      payload.availability = formData.get("availability");
    if (formData.has("stockQuantity"))
      payload.stockQuantity = parseInt(formData.get("stockQuantity") as string);
    if (formData.has("sku")) payload.sku = sku;
    if (formData.has("mpn")) payload.mpn = formData.get("mpn");
    if (formData.has("brand")) payload.brand = formData.get("brand");
    if (formData.has("condition"))
      payload.condition = formData.get("condition");
    if (formData.has("categoryId"))
      payload.categoryId = formData.get("categoryId");
    if (formData.has("productDetails"))
      payload.productDetails = parseJson("productDetails", undefined);
    if (formData.has("productHighlights"))
      payload.productHighlights = parseJson("productHighlights", undefined);
    if (formData.has("customLabel0"))
      payload.customLabel0 = formData.get("customLabel0");
    if (formData.has("customLabel1"))
      payload.customLabel1 = formData.get("customLabel1");
    if (formData.has("isActive"))
      payload.isActive = formData.get("isActive") === "true";
    if (formData.has("isBundle"))
      payload.isBundle = formData.get("isBundle") === "true";

    const validation = updateProductSchema.safeParse(payload);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 400);

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: validation.data,
    });
    return successResponse(updatedProduct, "Product updated successfully.");
  } catch (error: any) {
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    await requireAdmin();
    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    const linkedOrders = await prisma.orderItem.findFirst({
      where: { productId },
    });

    if (linkedOrders) {
      return errorResponse(
        "Cannot hard-delete this product because it is linked to customer orders. Please edit the product and uncheck 'Active' to hide it instead.",
        400,
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    const deletePromises: Promise<boolean>[] = [];

    if (product.imageLink) {
      deletePromises.push(deleteFile(product.imageLink));
    }

    if (
      product.additionalImageLinks &&
      product.additionalImageLinks.length > 0
    ) {
      product.additionalImageLinks.forEach((imgUrl) => {
        deletePromises.push(deleteFile(imgUrl));
      });
    }

    await Promise.allSettled(deletePromises);

    return successResponse(
      null,
      "Product and its images deleted successfully.",
    );
  } catch (error: any) {
    if (error.code === "P2003") {
      return errorResponse(
        "Cannot delete product because it is referenced elsewhere in the database.",
        400,
      );
    }

    return errorResponse(error.message || "Internal server error", 500);
  }
}
