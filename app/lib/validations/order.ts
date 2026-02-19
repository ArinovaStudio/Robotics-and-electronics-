import { z } from "zod";

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
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
  sort: z.enum(["newest", "oldest"]).default("newest"),
});

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "Address ID is required"),
  notes: z.string().optional(),
});
