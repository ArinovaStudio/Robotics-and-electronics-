import { z } from "zod";

// Sales report query schema
export const salesReportQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(["day", "week", "month"]).optional().default("day"),
  category: z.string().optional(), // Category slug
});

// Inventory report query schema
export const inventoryReportQuerySchema = z.object({
  category: z.string().optional(), // Category slug
  status: z.enum(["low_stock", "out_of_stock", "in_stock"]).optional(),
});
