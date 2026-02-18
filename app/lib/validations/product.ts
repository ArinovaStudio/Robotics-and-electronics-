import { z } from "zod";

export const listProductsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val))
    .pipe(z.number().int().min(1).max(100)),
  search: z.string().optional(),
  category: z.string().optional(), // Category slug
  sort: z
    .enum(["price_asc", "price_desc", "newest", "popular", "title_asc"])
    .optional()
    .default("newest"),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().min(0).optional()),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().min(0).optional()),
  brand: z.string().optional(), // Comma-separated brands
  availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PREORDER"]).optional(),
  condition: z.enum(["NEW", "REFURBISHED", "USED"]).optional(),
  customLabel0: z.string().optional(),
  customLabel1: z.string().optional(),
});
