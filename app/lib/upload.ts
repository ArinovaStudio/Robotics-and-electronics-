import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880");

export async function uploadFile(file: File, subfolder: string = ""): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
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