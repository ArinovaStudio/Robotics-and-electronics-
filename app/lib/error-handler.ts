import { errorResponse } from "./api-response";
import { Prisma } from "@prisma/client";

/**
 * Centralized error handling utility for API routes
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errors?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Handle errors in API routes with consistent logging and responses
 */
export function handleApiError(error: unknown, context: string = "API") {
  console.error(`${context} Error:`, error);

  // Handle known ApiError
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode, error.errors);
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  // Handle authorization errors
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (
      error.message.includes("Forbidden") ||
      error.message.includes("Admin access required")
    ) {
      return errorResponse(error.message, 403);
    }
    if (error.message.includes("not found")) {
      return errorResponse(error.message, 404);
    }
    if (error.message.includes("Insufficient stock")) {
      return errorResponse(error.message, 400);
    }
  }

  // Default to 500
  return errorResponse("Internal server error", 500);
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case "P2002": // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(", ") || "field";
      return errorResponse(`Duplicate value for ${field}`, 409);

    case "P2025": // Record not found
      return errorResponse("Record not found", 404);

    case "P2003": // Foreign key constraint violation
      return errorResponse("Related record not found", 400);

    case "P2014": // Invalid ID
      return errorResponse("Invalid ID format", 400);

    case "P2024": // Connection timeout
      return errorResponse("Database connection timeout", 503);

    default:
      console.error("Unhandled Prisma error:", error.code, error.message);
      return errorResponse("Database error", 500);
  }
}

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandling(
  handler: (request: Request, params?: any) => Promise<Response>,
  context: string = "API",
) {
  return async (request: Request, params?: any) => {
    try {
      return await handler(request, params);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}
