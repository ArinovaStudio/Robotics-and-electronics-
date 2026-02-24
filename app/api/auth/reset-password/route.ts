import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/app/lib/db";
import { resetPasswordSchema } from "@/app/lib/validations/auth";
import { isOTPExpired } from "@/app/lib/utils/otp";
import { sendPasswordChangedEmail } from "@/app/lib/email";
import { sanitizeEmail } from "@/app/lib/sanitization";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";
import { handleApiError } from "@/app/lib/error-handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { email, otp, newPassword } = validation.data;

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);

    // Find OTP token
    const otpToken = await prisma.otpToken.findFirst({
      where: {
        email: sanitizedEmail,
        token: otp,
        type: "PASSWORD_RESET",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpToken) {
      return notFoundResponse(
        "Invalid OTP code. Please check the code and try again.",
      );
    }

    // Check if OTP is already used
    if (otpToken.used) {
      return errorResponse(
        "This OTP has already been used. Please request a new one.",
        400,
      );
    }

    // Check if OTP is expired
    if (isOTPExpired(otpToken.expiresAt)) {
      return errorResponse(
        "This OTP has expired. Please request a new one.",
        400,
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return notFoundResponse("User account not found.");
    }

    // Hash new password with stronger rounds
    const hashedPassword = await hash(newPassword, 12);

    // Update user password and ensure email is verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerified: user.emailVerified || new Date(),
      },
    });

    // Mark OTP as used
    await prisma.otpToken.update({
      where: { id: otpToken.id },
      data: { used: true },
    });

    // Delete all PASSWORD_RESET tokens for this email
    await prisma.otpToken.deleteMany({
      where: {
        email: sanitizedEmail,
        type: "PASSWORD_RESET",
      },
    });

    // Send password changed confirmation email
    try {
      await sendPasswordChangedEmail(sanitizedEmail, user.name);
    } catch (emailError) {
      console.error("Failed to send password changed email:", emailError);
      // Don't fail the request if email sending fails
    }

    return successResponse(
      { email: sanitizedEmail },
      "Password reset successfully! You can now login with your new password.",
      200,
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return handleApiError(error, "Reset Password");
  }
}
