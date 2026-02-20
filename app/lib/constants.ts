/**
 * Application-wide configuration constants
 * Centralized for easy maintenance and updates
 */

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 499, // Free shipping for orders >= this amount
  STANDARD_COST: 50, // Standard shipping cost
  EXPRESS_COST: 100, // Express shipping cost (if you add this feature)
} as const;

export const TAX = {
  GST_RATE: 0.18, // 18% GST (can be made state-specific later)
  TAXABLE_SHIPPING: true, // Whether to apply tax on shipping
} as const;

export const INVENTORY = {
  LOW_STOCK_THRESHOLD: 10, // Alert when stock falls below
  OUT_OF_STOCK_THRESHOLD: 0,
  CRITICAL_STOCK_THRESHOLD: 20, // For admin alerts
} as const;

export const ORDERS = {
  ALLOWED_CANCEL_STATUSES: ["PENDING", "CONFIRMED"] as const,
  ALLOWED_REFUND_STATUSES: ["CONFIRMED", "PROCESSING", "SHIPPED"] as const,
  ORDER_NUMBER_PREFIX: "ORD",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PRODUCTS_PER_PAGE: 24,
  ORDERS_PER_PAGE: 10,
} as const;

// ============================================================================
// AUTHENTICATION & SECURITY
// ============================================================================

export const AUTH = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  JWT_EXPIRY_DAYS: 7,
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
} as const;

// ============================================================================
// FILE UPLOADS
// ============================================================================

export const UPLOADS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  MAX_FILES_PER_REQUEST: 10,
  ALLOWED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ] as const,
  ALLOWED_DIRECTORIES: [
    "/uploads/products/",
    "/uploads/categories/",
    "/uploads/users/",
  ] as const,
} as const;

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

export const DASHBOARD = {
  RECENT_ORDERS_LIMIT: 5,
  TOP_PRODUCTS_LIMIT: 5,
  LOW_STOCK_PRODUCTS_LIMIT: 10,
} as const;

// ============================================================================
// PAYMENT
// ============================================================================

export const PAYMENT = {
  CURRENCY: "INR",
  MAX_PAYMENT_AMOUNT: 500000, // Maximum order amount
  MIN_PAYMENT_AMOUNT: 1,
} as const;

// ============================================================================
// RATE LIMITING (for future implementation)
// ============================================================================

export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  LOGIN_ATTEMPTS_PER_HOUR: 5,
  OTP_REQUESTS_PER_HOUR: 3,
} as const;

// ============================================================================
// EMAIL
// ============================================================================

export const EMAIL = {
  FROM_NAME: "Electronics Store",
  FROM_EMAIL: process.env.EMAIL_FROM || "noreply@elecstore.com",
  SUPPORT_EMAIL: "support@elecstore.com",
} as const;

// ============================================================================
// VALIDATION
// ============================================================================

export const VALIDATION = {
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  ADDRESS_MAX_LENGTH: 500,
  DESCRIPTION_MAX_LENGTH: 5000,
  SEARCH_QUERY_MAX_LENGTH: 200,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate shipping cost based on order total
 */
export function calculateShippingCost(subtotal: number): number {
  return subtotal >= SHIPPING.FREE_SHIPPING_THRESHOLD
    ? 0
    : SHIPPING.STANDARD_COST;
}

/**
 * Calculate tax amount
 */
export function calculateTax(
  subtotal: number,
  shippingCost: number = 0,
): number {
  const taxableAmount = TAX.TAXABLE_SHIPPING
    ? subtotal + shippingCost
    : subtotal;
  return Math.round(taxableAmount * TAX.GST_RATE * 100) / 100;
}

/**
 * Calculate total order amount
 */
export function calculateOrderTotal(
  subtotal: number,
  discount: number = 0,
): {
  subtotal: number;
  discount: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
} {
  const finalSubtotal = subtotal - discount;
  const shippingCost = calculateShippingCost(finalSubtotal);
  const taxAmount = calculateTax(finalSubtotal, shippingCost);
  const totalAmount = finalSubtotal + shippingCost + taxAmount;

  return {
    subtotal,
    discount,
    shippingCost,
    taxAmount,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

/**
 * Check if stock is low
 */
export function isLowStock(quantity: number): boolean {
  return quantity > 0 && quantity <= INVENTORY.LOW_STOCK_THRESHOLD;
}

/**
 * Check if stock is critical (for admin alerts)
 */
export function isCriticalStock(quantity: number): boolean {
  return quantity > 0 && quantity <= INVENTORY.CRITICAL_STOCK_THRESHOLD;
}

/**
 * Check if product is out of stock
 */
export function isOutOfStock(quantity: number): boolean {
  return quantity <= INVENTORY.OUT_OF_STOCK_THRESHOLD;
}
