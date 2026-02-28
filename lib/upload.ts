import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB default

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILES_PER_REQUEST = 10;

export async function uploadFile(
  file: File,
  subfolder: string = "",
): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadPath = path.join(process.cwd(), UPLOAD_DIR, subfolder);
  await mkdir(uploadPath, { recursive: true });

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const extension = file.name.split(".").pop();
  const filename = `${uniqueSuffix}.${extension}`;
  const filePath = path.join(uploadPath, filename);

  await writeFile(filePath, buffer);

  return `/uploads/${subfolder ? subfolder + "/" : ""}${filename}`;
}

export async function deleteFile(publicUrl: string): Promise<boolean> {
  if (!publicUrl || !publicUrl.startsWith("/uploads/")) return false;

  try {
    const relativePath = publicUrl.replace("/uploads/", "");
    const absolutePath = path.join(process.cwd(), UPLOAD_DIR, relativePath);
    await unlink(absolutePath);
    return true;
  } catch {
    return false;
  }
}
// Upload multiple files
export async function uploadMultipleFiles(
  files: File[],
  subfolder: string = "",
): Promise<
  Array<{
    originalName: string;
    fileName: string;
    path: string;
    size: number;
    type: string;
  }>
> {
  if (files.length === 0) {
    throw new Error("No files provided");
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    throw new Error(
      `Maximum ${MAX_FILES_PER_REQUEST} files allowed per request`,
    );
  }

  const uploadedFiles = [];

  for (const file of files) {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(
        `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File ${file.name} exceeds size limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Upload file
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

  return uploadedFiles;
}

// Export constants for validation
export { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, MAX_FILES_PER_REQUEST };
