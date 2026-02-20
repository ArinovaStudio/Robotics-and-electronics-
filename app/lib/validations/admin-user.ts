import { z } from "zod";

// Admin list users query schema
export const adminListUsersQuerySchema = z.object({
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
  role: z.enum(["CUSTOMER", "ADMIN"]).optional(),
  verified: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined,
    )
    .pipe(z.boolean().optional()),
  sort: z
    .enum(["newest", "alphabetical", "orders"])
    .optional()
    .default("newest"),
});
