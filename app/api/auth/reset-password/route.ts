import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json( { success: false, message: "Missing required fields" }, { status: 400 });
    }

    const existingOtp = await prisma.otpToken.findFirst({ where: { email, code: otp, type: "PASSWORD_RESET" } });
    
    if (!existingOtp) {
        return NextResponse.json( { success: false, message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > existingOtp.expiresAt) {
        await prisma.otpToken.delete({ where: { id: existingOtp.id } });
        return NextResponse.json( { success: false, message: "This OTP has expired" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json( { success: false, message: "User not found" },{ status: 404 });
    }

    const hashedPassword = await hash(newPassword, 12);

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });

    await prisma.otpToken.delete({ where: { id: existingOtp.id } });

    return NextResponse.json({ success: true, message: "Password reset successful" });

  } catch {
    return NextResponse.json( { success: false, message: "Internal server error" }, { status: 500 });
  }
}