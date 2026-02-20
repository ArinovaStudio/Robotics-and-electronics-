import { z } from "zod";

// Admin list payments query schema
export const adminListPaymentsQuerySchema = z.object({
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
  status: z
    .enum([
      "PENDING",
      "PROCESSING",
      "SUCCESS",
      "FAILED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  paymentMethod: z.string().optional(), // card, upi, netbanking, wallet
});
