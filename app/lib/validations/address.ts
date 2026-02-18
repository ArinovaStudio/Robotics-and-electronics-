import { z } from "zod";

export const createAddressSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  addressLine1: z
    .string()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(200, "Address line 1 is too long"),
  addressLine2: z.string().max(200, "Address line 2 is too long").optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City name is too long"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(100, "State name is too long"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
  type: z.enum(["SHIPPING", "BILLING"]).default("SHIPPING"),
});

export const updateAddressSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be 10 digits")
    .optional(),
  addressLine1: z
    .string()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(200, "Address line 1 is too long")
    .optional(),
  addressLine2: z.string().max(200, "Address line 2 is too long").optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City name is too long")
    .optional(),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(100, "State name is too long")
    .optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be 6 digits")
    .optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
  type: z.enum(["SHIPPING", "BILLING"]).optional(),
});
