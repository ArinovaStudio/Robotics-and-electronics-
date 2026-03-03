import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().min(6, "OTP must be 6 characters"),
  type: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET", "LOGIN_VERIFICATION"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Validation Errors", error: validation.error.issues[0].message }, { status: 400 });
    }

    const { email, code, type } = validation.data;

    const existingOtp = await prisma.otpToken.findFirst({ where: { email, code, type } });

    if (!existingOtp) {
      return NextResponse.json( { success: false, message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > existingOtp.expiresAt) {
      await prisma.otpToken.delete({ where: { id: existingOtp.id } });
      return NextResponse.json( { success: false, message: "This OTP has expired" }, { status: 400 });
    }

    if (type === "EMAIL_VERIFICATION") {
      await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
    }

    await prisma.otpToken.delete({ where: { id: existingOtp.id } });

    return NextResponse.json( { success: true, message: "OTP verified successfully" }, { status: 200 });

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}