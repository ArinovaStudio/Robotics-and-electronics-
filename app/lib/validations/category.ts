import { z } from "zod";

export const listCategoriesQuerySchema = z.object({
  includeProducts: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  includeChildren: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  parentId: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    ),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (lowercase, hyphens only)",
    ),
  description: z.string().max(500, "Description is too long").optional(),
  image: z.string().url("Image must be a valid URL").optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters")
    .optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly (lowercase, hyphens only)",
    )
    .optional(),
  description: z.string().max(500, "Description is too long").optional(),
  image: z.string().url("Image must be a valid URL").optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const categoryProductsQuerySchema = z.object({
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
  sort: z
    .enum(["price_asc", "price_desc", "newest", "popular"])
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
});
