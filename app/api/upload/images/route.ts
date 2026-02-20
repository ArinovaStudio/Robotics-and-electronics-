import { NextRequest } from "next/server";
import { requireAuth } from "@/app/lib/auth";
import { successResponse, errorResponse } from "@/app/lib/api-response";
import { uploadImagesSchema } from "@/app/lib/validations/upload";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { deleteFile } from "@/app/lib/upload";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB
const MAX_FILES_PER_REQUEST = 10;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// POST /api/upload/images - Upload multiple images
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    const formData = await request.formData();

    // Get type and entityId
    const type = formData.get("type") as string;
    const entityId = formData.get("entityId") as string | null;

    // Validate type and entityId
    const validation = uploadImagesSchema.safeParse({
      type,
      entityId: entityId || undefined,
    });

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const { type: uploadType, entityId: validatedEntityId } = validation.data;

    // Check admin authorization for product and category uploads
    if (
      (uploadType === "product" || uploadType === "category") &&
      user.role !== "ADMIN"
    ) {
      return errorResponse(
        "Admin access required for product/category uploads",
        403,
      );
    }

    // Get all files from formData
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "files" && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return errorResponse("No files provided", 400);
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return errorResponse(
        `Maximum ${MAX_FILES_PER_REQUEST} files allowed per request`,
        400,
      );
    }

    // Determine subfolder based on type
    let subfolder = "";
    switch (uploadType) {
      case "product":
        subfolder = validatedEntityId
          ? `products/${validatedEntityId}`
          : "products";
        break;
      case "category":
        subfolder = "categories";
        break;
      case "user":
        subfolder = "users";
        break;
    }

    // Upload files
    const uploadedFiles = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return errorResponse(
          `Invalid file type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
          400,
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(
          `File ${file.name} exceeds size limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          413,
        );
      }

      // Process file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadPath = path.join(process.cwd(), UPLOAD_DIR, subfolder);
      await mkdir(uploadPath, { recursive: true });

      // Generate unique filename with UUID
      const uuid = randomUUID();
      const extension = file.name.split(".").pop() || "jpg";
      const sanitizedName = file.name
        .split(".")[0]
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()
        .substring(0, 50);
      const filename = `${uuid}-${sanitizedName}.${extension}`;
      const filePath = path.join(uploadPath, filename);

      await writeFile(filePath, buffer);

      const publicPath = `/uploads/${subfolder ? subfolder + "/" : ""}${filename}`;

      uploadedFiles.push({
        originalName: file.name,
        fileName: filename,
        path: publicPath,
        size: file.size,
        type: file.type,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Images uploaded successfully.",
        data: {
          files: uploadedFiles,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("Upload error:", error);

    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("required")
    ) {
      return errorResponse(error.message, 401);
    }

    return (
      error.response ||
      new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500 },
      )
    );
  }
}

// DELETE /api/upload/images - Delete an image
export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAuth();

    if (user.role !== "ADMIN") {
      return errorResponse("Admin access required", 403);
    }

    const body = await request.json();
    const { path: imagePath } = body;

    if (!imagePath) {
      return errorResponse("Image path is required", 400);
    }

    // Validate path is within allowed directories
    if (!imagePath.startsWith("/uploads/")) {
      return errorResponse("Invalid image path", 400);
    }

    // Validate path doesn't contain directory traversal
    if (imagePath.includes("..")) {
      return errorResponse("Invalid image path", 400);
    }

    // Validate path is in allowed directories
    const allowedDirs = [
      "/uploads/products/",
      "/uploads/categories/",
      "/uploads/users/",
    ];
    const isAllowed = allowedDirs.some((dir) => imagePath.startsWith(dir));

    if (!isAllowed) {
      return errorResponse("Image path not in allowed directories", 400);
    }

    // Delete the file
    const deleted = await deleteFile(imagePath);

    if (!deleted) {
      return errorResponse("File not found or could not be deleted", 404);
    }

    return successResponse(null, "Image deleted successfully.");
  } catch (error: any) {
    console.error("Delete error:", error);

    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("required")
    ) {
      return errorResponse(error.message, 401);
    }

    return (
      error.response ||
      new Response(
        JSON.stringify({ success: false, error: "Internal server error" }),
        { status: 500 },
      )
    );
  }
}
