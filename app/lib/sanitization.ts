/**
 * Input sanitization utilities to prevent injection attacks
 */

/**
 * Sanitize string input by removing dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input) return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .substring(0, 500); // Limit length
}

/**
 * Sanitize search query for database operations
 * Escapes special Prisma contains characters
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";

  return sanitizeString(query).replace(/[%_]/g, "\\$&"); // Escape SQL wildcards
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";

  return email.trim().toLowerCase().substring(0, 255);
}

/**
 * Sanitize phone number (remove non-digits except +)
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return "";

  return phone.replace(/[^\d+]/g, "").substring(0, 15);
}

/**
 * Sanitize slug/URL-safe string
 */
export function sanitizeSlug(slug: string): string {
  if (!slug) return "";

  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

/**
 * Validate and sanitize file path
 * Prevents directory traversal attacks
 */
export function sanitizeFilePath(filePath: string): string {
  if (!filePath) return "";

  // Remove any directory traversal attempts
  const sanitized = filePath.replace(/\.\./g, "").replace(/[\\]/g, "/");

  // Ensure path starts with /uploads/
  if (!sanitized.startsWith("/uploads/")) {
    throw new Error("Invalid file path");
  }

  return sanitized;
}

/**
 * Validate integer input
 */
export function sanitizeInteger(
  value: any,
  min?: number,
  max?: number,
): number {
  const num = parseInt(String(value), 10);

  if (isNaN(num)) {
    throw new Error("Invalid integer value");
  }

  if (min !== undefined && num < min) {
    throw new Error(`Value must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    throw new Error(`Value must be at most ${max}`);
  }

  return num;
}

/**
 * Sanitize HTML content (basic sanitization)
 * For production, use a library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}
