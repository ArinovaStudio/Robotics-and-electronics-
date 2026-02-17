import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { forgotPasswordSchema } from "@/app/lib/validations/auth";
import { generateOTP, getOTPExpiryTime } from "@/app/lib/utils/otp";
import { sendOTPEmail } from "@/app/lib/email";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/app/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { email } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return successResponse(
        null,
        "If the email exists, you will receive a password reset OTP",
        200,
      );
    }

    // Delete existing PASSWORD_RESET OTPs for this email
    await prisma.otpToken.deleteMany({
      where: {
        email,
        type: "PASSWORD_RESET",
      },
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime(15); // 15 minutes

    // Save OTP to database
    await prisma.otpToken.create({
      data: {
        email,
        token: otp,
        type: "PASSWORD_RESET",
        expiresAt,
        used: false,
      },
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, "PASSWORD_RESET");
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Don't throw error to prevent email enumeration
      // Silently fail but log the error
    }

    return successResponse(
      null,
      "If the email exists, you will receive a password reset OTP",
      200,
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse("Internal server error", 500);
  }
}
