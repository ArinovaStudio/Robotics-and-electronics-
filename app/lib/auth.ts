import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { verifyToken } from "@/app/lib/jwt";
import prisma from "@/app/lib/db";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

// Check for JWT token in Authorization header or cookies
async function getUserFromToken() {
  const headersList = await headers();
  const authorization = headersList.get("authorization");
  const cookieHeader = headersList.get("cookie") || "";

  let token: string | null = null;

  // First, try Authorization header (Bearer token)
  if (authorization?.startsWith("Bearer ")) {
    token = authorization.substring(7);
  }

  // If no Authorization header, check cookies
  if (!token && cookieHeader) {
    const cookies = cookieHeader.split("; ");
    const authCookie = cookies.find((c) => c.startsWith("auth_token="));
    if (authCookie) {
      token = authCookie.split("=")[1];
    }
  }

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      image: true,
      phone: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
  };
}

export async function requireAuth() {
  // First, try to get user from session (for web)
  const session = await getSession();
  if (session?.user) {
    return session.user;
  }

  // If no session, try to get user from token (for API testing)
  const user = await getUserFromToken();
  if (user) {
    return user;
  }

  throw new Error("Unauthorized");
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

export function isAdmin(role: string): boolean {
  return role === "ADMIN";
}
