import { NextRequest } from "next/server";
import { compare } from "bcryptjs";
import prisma from "@/app/lib/db";
import { generateToken } from "@/app/lib/jwt";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/app/lib/api-response";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        emailVerified: true,
        image: true,
        phone: true,
      },
    });

    if (!user || !user.password) {
      return errorResponse("Invalid email or password", 401);
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return errorResponse("Please verify your email before logging in", 403);
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data with token (password excluded)
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(
      {
        token,
        user: userWithoutPassword,
      },
      "Login successful",
      200,
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
