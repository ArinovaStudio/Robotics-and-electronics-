import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { resendOtpSchema } from "@/app/lib/validations/auth";
import { generateOTP, getOTPExpiryTime } from "@/app/lib/utils/otp";
import { sendOTPEmail } from "@/app/lib/email";
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
    const validation = resendOtpSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { email, type } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return notFoundResponse("User not found");
    }

    // For EMAIL_VERIFICATION: Check if already verified
    if (type === "EMAIL_VERIFICATION" && user.emailVerified) {
      return errorResponse("Email is already verified");
    }

    // Rate limiting: Check recent OTP requests (max 3 in last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentOtpCount = await prisma.otpToken.count({
      where: {
        email,
        type,
        createdAt: {
          gte: fifteenMinutesAgo,
        },
      },
    });

    if (recentOtpCount >= 3) {
      return errorResponse(
        "Too many OTP requests. Please try again after 15 minutes",
        429,
      );
    }

    // Delete existing OTPs for this email and type
    await prisma.otpToken.deleteMany({
      where: {
        email,
        type,
      },
    });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime(10); // 10 minutes

    // Save OTP to database
    await prisma.otpToken.create({
      data: {
        email,
        token: otp,
        type,
        expiresAt,
        used: false,
      },
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, type);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return errorResponse("Failed to send OTP email. Please try again.", 500);
    }

    return successResponse(null, "OTP sent successfully", 200);
  } catch (error) {
    console.error("Resend OTP error:", error);
    return errorResponse("Internal server error", 500);
  }
}
