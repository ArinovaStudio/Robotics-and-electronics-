import { z } from "zod";

// Upload images schema
export const uploadImagesSchema = z.object({
  type: z.enum(["product", "category", "user"]),
  entityId: z.string().optional(),
});
