import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";
import { errorResponse } from "./api-response";
import prisma from "./db";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload & { id: string };
}

/**
 * Middleware to verify JWT token and authenticate requests
 * Extracts token from Authorization header (Bearer token) or cookies
 */
export async function authenticateRequest(
  request: NextRequest,
): Promise<
  { user: JWTPayload; error: null } | { user: null; error: Response }
> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get("authorization");
    let token: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Fallback: Try to get token from cookies
    if (!token) {
      token = request.cookies.get("auth_token")?.value || null;
    }

    if (!token) {
      return {
        user: null,
        error: errorResponse("Authentication required. Please login.", 401),
      };
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return {
        user: null,
        error: errorResponse(
          "Invalid or expired token. Please login again.",
          401,
        ),
      };
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, emailVerified: true },
    });

    if (!user) {
      return {
        user: null,
        error: errorResponse("User account not found.", 401),
      };
    }

    if (!user.emailVerified) {
      return {
        user: null,
        error: errorResponse(
          "Please verify your email before accessing this resource.",
          403,
        ),
      };
    }

    return {
      user: decoded,
      error: null,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      user: null,
      error: errorResponse("Authentication failed.", 401),
    };
  }
}

/**
 * Middleware to verify user has admin role
 */
export async function requireAdmin(
  request: NextRequest,
): Promise<
  { user: JWTPayload; error: null } | { user: null; error: Response }
> {
  const authResult = await authenticateRequest(request);

  if (authResult.error) {
    return authResult;
  }

  if (authResult.user?.role !== "ADMIN") {
    return {
      user: null,
      error: errorResponse(
        "Admin access required. You don't have permission to access this resource.",
        403,
      ),
    };
  }

  return authResult;
}

/**
 * Helper to extract user ID from authenticated request
 */
export function getUserIdFromRequest(user: JWTPayload | null): string {
  if (!user?.userId) {
    throw new Error("User not authenticated");
  }
  return user.userId;
}
