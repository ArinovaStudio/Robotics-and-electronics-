import { Prisma } from "@prisma/client";
import { PriceValue } from "./types/prisma";

/**
 * Reusable product query utilities to reduce code duplication
 */

export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  availability?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface ProductSortOptions {
  sort?: "price_asc" | "price_desc" | "newest" | "popularity" | "name_asc";
}

/**
 * Build Prisma where clause for product filtering
 */
export function buildProductWhereClause(
  filters: ProductFilters,
  searchTerm?: string,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    isActive: filters.isActive ?? true,
  };

  // Search across multiple fields
  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      { brand: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // Category filter
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  // Availability filter
  if (filters.availability) {
    where.availability = filters.availability as any;
  }

  return where;
}

/**
 * Filter products by price range and brands (in-memory filtering for JSON fields)
 */
export function filterProductsByPriceAndBrand(
  products: any[],
  filters: ProductFilters,
): any[] {
  return products.filter((product) => {
    // Get effective price (salePrice or regular price)
    const price = product.salePrice?.value ?? product.price?.value ?? 0;

    // Price range filter
    if (filters.minPrice !== undefined && price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && price > filters.maxPrice) {
      return false;
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      if (!product.brand || !filters.brands.includes(product.brand)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort products based on sort option
 */
export function sortProducts(products: any[], sort: string = "newest"): any[] {
  const sorted = [...products];

  switch (sort) {
    case "price_asc":
      sorted.sort((a, b) => {
        const priceA = a.salePrice?.value ?? a.price?.value ?? 0;
        const priceB = b.salePrice?.value ?? b.price?.value ?? 0;
        return priceA - priceB;
      });
      break;

    case "price_desc":
      sorted.sort((a, b) => {
        const priceA = a.salePrice?.value ?? a.price?.value ?? 0;
        const priceB = b.salePrice?.value ?? b.price?.value ?? 0;
        return priceB - priceA;
      });
      break;

    case "name_asc":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;

    case "popularity":
      // Would need sales data, fallback to stock quantity
      sorted.sort((a, b) => b.stockQuantity - a.stockQuantity);
      break;

    case "newest":
    default:
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  return sorted;
}

/**
 * Format product for API response
 */
export function formatProductForResponse(product: any) {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    link: product.link,
    imageLink: product.imageLink,
    additionalImageLinks: product.additionalImageLinks || [],
    price: product.price,
    salePrice: product.salePrice,
    salePriceEffectiveDate: product.salePriceEffectiveDate,
    availability: product.availability,
    stockQuantity: product.stockQuantity,
    sku: product.sku,
    mpn: product.mpn,
    brand: product.brand,
    condition: product.condition,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
    productDetails: product.productDetails || [],
    productHighlights: product.productHighlights || [],
    customLabel0: product.customLabel0,
    customLabel1: product.customLabel1,
    isActive: product.isActive,
    isBundle: product.isBundle,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number,
) {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    pageSize: limit,
    totalItems: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Extract unique brands from products
 */
export function extractAvailableBrands(products: any[]): string[] {
  const brands = products
    .map((p) => p.brand)
    .filter((b): b is string => b !== null && b !== undefined);
  return [...new Set(brands)].sort();
}

/**
 * Extract available price range from products
 */
export function extractPriceRange(products: any[]): {
  min: number;
  max: number;
} {
  const prices = products
    .map((p) => p.salePrice?.value ?? p.price?.value ?? 0)
    .filter((p) => p > 0);

  if (prices.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Extract available stock statuses
 */
export function extractAvailabilities(products: any[]): string[] {
  return [...new Set(products.map((p) => p.availability))];
}
