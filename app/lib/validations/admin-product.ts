import { z } from "zod";

// Admin product list query schema
export const adminListProductsQuerySchema = z.object({
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
  category: z.string().optional(),
  availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PREORDER"]).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    )
    .pipe(z.boolean().optional()),
  sort: z
    .enum([
      "price_asc",
      "price_desc",
      "newest",
      "title_asc",
      "stock_asc",
      "stock_desc",
    ])
    .optional()
    .default("newest"),
});

// Create product schema
export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().min(1, "Link/slug is required"),

  imageLink: z.string().min(1, "Primary image is required"),
  additionalImageLinks: z.array(z.string()).optional().default([]),

  price: z.object({
    value: z.number().positive("Price must be positive"),
    currency: z.string().default("INR"),
  }),
  salePrice: z
    .object({
      value: z.number().positive(),
      currency: z.string().default("INR"),
    })
    .optional()
    .nullable(),
  salePriceEffectiveDate: z
    .object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    })
    .optional()
    .nullable(),

  availability: z
    .enum(["IN_STOCK", "OUT_OF_STOCK", "PREORDER"])
    .default("IN_STOCK"),
  stockQuantity: z.number().int().min(0).default(0),

  sku: z.string().min(1, "SKU is required"),
  mpn: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),

  condition: z.enum(["NEW", "REFURBISHED", "USED"]).default("NEW"),

  categoryId: z.string().min(1, "Category is required"),

  productDetails: z
    .array(
      z.object({
        sectionName: z.string(),
        attributeName: z.string(),
        attributeValue: z.string(),
      }),
    )
    .optional()
    .default([]),

  productHighlights: z.array(z.string()).optional().default([]),

  customLabel0: z.string().optional().nullable(),
  customLabel1: z.string().optional().nullable(),

  isActive: z.boolean().default(true),
  isBundle: z.boolean().default(false),
});

// Update product schema (all fields optional except id)
export const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  link: z.string().min(1).optional(),

  imageLink: z.string().min(1).optional(),
  additionalImageLinks: z.array(z.string()).optional(),

  price: z
    .object({
      value: z.number().positive(),
      currency: z.string().default("INR"),
    })
    .optional(),
  salePrice: z
    .object({
      value: z.number().positive(),
      currency: z.string().default("INR"),
    })
    .optional()
    .nullable(),
  salePriceEffectiveDate: z
    .object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    })
    .optional()
    .nullable(),

  availability: z.enum(["IN_STOCK", "OUT_OF_STOCK", "PREORDER"]).optional(),
  stockQuantity: z.number().int().min(0).optional(),

  sku: z.string().min(1).optional(),
  mpn: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),

  condition: z.enum(["NEW", "REFURBISHED", "USED"]).optional(),

  categoryId: z.string().min(1).optional(),

  productDetails: z
    .array(
      z.object({
        sectionName: z.string(),
        attributeName: z.string(),
        attributeValue: z.string(),
      }),
    )
    .optional(),

  productHighlights: z.array(z.string()).optional(),

  customLabel0: z.string().optional().nullable(),
  customLabel1: z.string().optional().nullable(),

  isActive: z.boolean().optional(),
  isBundle: z.boolean().optional(),
});
