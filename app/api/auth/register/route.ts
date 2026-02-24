import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/app/lib/db";
import { registerSchema } from "@/app/lib/validations/auth";
import { generateOTP, getOTPExpiryTime } from "@/app/lib/utils/otp";
import { sendOTPEmail } from "@/app/lib/email";
import { sanitizeString, sanitizeEmail } from "@/app/lib/sanitization";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/app/lib/api-response";
import { handleApiError } from "@/app/lib/error-handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { name, email, password, phone } = validation.data;

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedName = sanitizeString(name);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return errorResponse(
        "An account with this email already exists. Please login instead.",
        409,
      );
    }

    // Hash password with stronger rounds
    const hashedPassword = await hash(password, 12);

    // Create user with transaction to ensure atomicity
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        phone: phone || null,
        role: "CUSTOMER",
        emailVerified: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime(10); // 10 minutes

    // Save OTP to database
    await prisma.otpToken.create({
      data: {
        email: user.email,
        token: otp,
        type: "EMAIL_VERIFICATION",
        expiresAt,
        used: false,
      },
    });

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otp, "EMAIL_VERIFICATION");
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Delete the user and OTP if email sending fails
      await prisma.$transaction([
        prisma.otpToken.deleteMany({ where: { email: user.email } }),
        prisma.user.delete({ where: { id: user.id } }),
      ]);
      return errorResponse(
        "Failed to send verification email. Please check your email address and try again.",
        500,
      );
    }

    return successResponse(
      {
        userId: user.id,
        email: user.email,
        message:
          "Registration successful! Please check your email for the verification code.",
      },
      "Registration successful. Please verify your email.",
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return handleApiError(error, "Registration");
  }
}
