import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/app/lib/db";
import { registerSchema } from "@/app/lib/validations/auth";
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
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { name, email, password, phone } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("Email already exists", 409);
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
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
      // Delete the user if email sending fails
      await prisma.user.delete({ where: { id: user.id } });
      return errorResponse(
        "Failed to send verification email. Please try again.",
        500,
      );
    }

    return successResponse(
      {
        userId: user.id,
        email: user.email,
      },
      "Registration successful. Please verify your email.",
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse("Internal server error", 500);
  }
}
