import { NextRequest, NextResponse } from "next/server";
import sendEmail from "@/lib/email";
import { getContactUsTemplate } from "@/lib/templates";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const emailHtml = getContactUsTemplate(name, email, subject, message);

    const targetEmail = process.env.EMAIL_USER || "tsy1@tsquarey.store";
    const emailSubject = `Contact Form: ${subject}`;

    const isSent = await sendEmail(targetEmail, emailSubject, emailHtml);

    if (isSent) {
      return NextResponse.json({ success: true, message: "Message sent successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 });
    }

  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}