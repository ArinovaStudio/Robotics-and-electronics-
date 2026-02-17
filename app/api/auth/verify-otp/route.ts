import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { verifyOtpSchema } from "@/app/lib/validations/auth";
import { isOTPExpired } from "@/app/lib/utils/otp";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = verifyOtpSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { email, otp, type } = validation.data;

    // Find OTP token
    const otpToken = await prisma.otpToken.findFirst({
      where: {
        email,
        token: otp,
        type,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpToken) {
      return notFoundResponse("Invalid OTP");
    }

    // Check if OTP is already used
    if (otpToken.used) {
      return errorResponse("OTP has already been used");
    }

    // Check if OTP is expired
    if (isOTPExpired(otpToken.expiresAt)) {
      return errorResponse("OTP has expired");
    }

    // Mark OTP as used
    await prisma.otpToken.update({
      where: { id: otpToken.id },
      data: { used: true },
    });

    // Update user emailVerified if it's email verification
    if (type === "EMAIL_VERIFICATION") {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });
    }

    // Delete all OTP tokens for this email and type
    await prisma.otpToken.deleteMany({
      where: {
        email,
        type,
      },
    });

    return successResponse(
      null,
      type === "EMAIL_VERIFICATION"
        ? "Email verified successfully"
        : "OTP verified successfully",
      200,
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return errorResponse("Internal server error", 500);
  }
}
