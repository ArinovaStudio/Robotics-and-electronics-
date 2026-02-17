import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/app/lib/db";
import { resetPasswordSchema } from "@/app/lib/validations/auth";
import { isOTPExpired } from "@/app/lib/utils/otp";
import { sendPasswordChangedEmail } from "@/app/lib/email";
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
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { email, otp, newPassword } = validation.data;

    // Find OTP token
    const otpToken = await prisma.otpToken.findFirst({
      where: {
        email,
        token: otp,
        type: "PASSWORD_RESET",
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

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return notFoundResponse("User not found");
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Mark OTP as used
    await prisma.otpToken.update({
      where: { id: otpToken.id },
      data: { used: true },
    });

    // Delete all PASSWORD_RESET tokens for this email
    await prisma.otpToken.deleteMany({
      where: {
        email,
        type: "PASSWORD_RESET",
      },
    });

    // Send password changed confirmation email
    try {
      await sendPasswordChangedEmail(email, user.name);
    } catch (emailError) {
      console.error("Failed to send password changed email:", emailError);
      // Don't fail the request if email sending fails
    }

    return successResponse(
      null,
      "Password reset successfully. Please login with your new password.",
      200,
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse("Internal server error", 500);
  }
}
