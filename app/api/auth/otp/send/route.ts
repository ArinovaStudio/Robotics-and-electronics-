import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import sendEmail from "@/lib/email";
import { getOTPTemplate } from "@/lib/templates";

const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET", "LOGIN_VERIFICATION"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Validation Errors", error: validation.error.issues[0].message }, { status: 400 });
    }

    const { email, type } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (type === "EMAIL_VERIFICATION" && user.emailVerified) {
      return NextResponse.json({ success: false, message: "Email already verified" }, { status: 400 });
    }

    await prisma.otpToken.deleteMany({ where: { email, type } });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpToken.create({
      data: {
        email,
        code: otp,
        type,
        expiresAt,
      },
    });

    let subject = "Verify Your Email";
    if (type === "PASSWORD_RESET") subject = "Reset Your Password";
    if (type === "LOGIN_VERIFICATION") subject = "Your Login Verification Code";
    
    const htmlTemplate = getOTPTemplate(otp, type);
    
    const emailSent = await sendEmail(email, subject, htmlTemplate);

    if (!emailSent) {
      return NextResponse.json({ success: false, message: "Failed to send the email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}