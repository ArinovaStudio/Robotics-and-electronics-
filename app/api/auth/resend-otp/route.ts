import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { resendOtpSchema } from "@/app/lib/validations/auth";
import { generateOTP, getOTPExpiryTime } from "@/app/lib/utils/otp";
import { sendOTPEmail } from "@/app/lib/email";
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
    const validation = resendOtpSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { email, type } = validation.data;

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      return notFoundResponse(
        "No account found with this email. Please register first.",
      );
    }

    // For EMAIL_VERIFICATION: Check if already verified
    if (type === "EMAIL_VERIFICATION" && user.emailVerified) {
      return errorResponse(
        "Your email is already verified. You can login now.",
        400,
      );
    }

    // Rate limiting: Check recent OTP requests (max 3 in last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentOtpCount = await prisma.otpToken.count({
      where: {
        email: sanitizedEmail,
        type,
        createdAt: {
          gte: fifteenMinutesAgo,
        },
      },
    });

    if (recentOtpCount >= 3) {
      return errorResponse(
        "Too many OTP requests. Please wait 15 minutes before requesting again.",
        429,
      );
    }

    // Delete existing OTPs for this email and type
    await prisma.otpToken.deleteMany({
      where: {
        email: sanitizedEmail,
        type,
      },
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime(10); // 10 minutes

    // Save OTP to database
    await prisma.otpToken.create({
      data: {
        email: sanitizedEmail,
        token: otp,
        type,
        expiresAt,
        used: false,
      },
    });

    // Send OTP email
    try {
      await sendOTPEmail(sanitizedEmail, otp, type);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return errorResponse(
        "Failed to send OTP email. Please check your email address and try again.",
        500,
      );
    }

    return successResponse(
      { email: sanitizedEmail },
      "Verification code sent successfully! Please check your email.",
      200,
    );
  } catch (error) {
    console.error("Resend OTP error:", error);
    return handleApiError(error, "Resend OTP");
  }
}
