import { z } from "zod";

// Admin list orders query schema
export const adminListOrdersQuerySchema = z.object({
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
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  paymentStatus: z
    .enum([
      "PENDING",
      "PROCESSING",
      "SUCCESS",
      "FAILED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ])
    .optional(),
  sort: z
    .enum(["newest", "oldest", "amount_high", "amount_low"])
    .optional()
    .default("newest"),
});

// Update order status schema
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  notes: z.string().optional(),
});
