import { Prisma } from "@prisma/client";

// Reusable Prisma types for dynamic queries
export type WhereClause<T> = Partial<T> & {
  OR?: WhereClause<T>[];
  AND?: WhereClause<T>[];
  NOT?: WhereClause<T> | WhereClause<T>[];
};

// Product query types
export type ProductWhereInput = Prisma.ProductWhereInput;
export type ProductOrderByInput = Prisma.ProductOrderByWithRelationInput;
export type ProductInclude = Prisma.ProductInclude;

// Order query types
export type OrderWhereInput = Prisma.OrderWhereInput;
export type OrderOrderByInput = Prisma.OrderOrderByWithRelationInput;
export type OrderInclude = Prisma.OrderInclude;

// User query types
export type UserWhereInput = Prisma.UserWhereInput;
export type UserOrderByInput = Prisma.UserOrderByWithRelationInput;

// Category query types
export type CategoryWhereInput = Prisma.CategoryWhereInput;
export type CategoryInclude = Prisma.CategoryInclude;

// Payment query types
export type PaymentWhereInput = Prisma.PaymentWhereInput;

// Product with relations type
export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

// Order with relations type
export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    items: true;
    payment: true;
    address: true;
    user: true;
  };
}>;

// Update data types (exclude relations and computed fields)
export type ProductUpdateInput = Omit<
  Prisma.ProductUpdateInput,
  "category" | "orderItems" | "cartItems" | "createdAt" | "updatedAt"
>;

export type CategoryUpdateInput = Omit<
  Prisma.CategoryUpdateInput,
  "parent" | "children" | "products" | "createdAt" | "updatedAt"
>;

export type UserUpdateInput = Omit<
  Prisma.UserUpdateInput,
  | "accounts"
  | "cart"
  | "orders"
  | "addresses"
  | "otpTokens"
  | "createdAt"
  | "updatedAt"
>;

// Price type helper
export interface PriceValue {
  value: number;
  currency: string;
}

// Product JSON field types
export interface ProductDetail {
  sectionName: string;
  attributeName: string;
  attributeValue: string;
}

export interface SalePriceEffectiveDate {
  startDate: string;
  endDate: string;
}
