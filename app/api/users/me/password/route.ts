import { NextRequest } from "next/server";
import { hash, compare } from "bcryptjs";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import { changePasswordSchema } from "@/app/lib/validations/auth";
import { sendPasswordChangedEmail } from "@/app/lib/email";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/app/lib/api-response";

export async function PATCH(request: NextRequest) {
  try {
    // Get authenticated user
    const currentUser = await requireAuth();

    if (!currentUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { currentPassword, newPassword } = validation.data;

    // Find user with password
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      return errorResponse("Cannot change password for OAuth accounts", 400);
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return errorResponse("Current password is incorrect", 400);
    }

    // Check if new password is same as current
    const isSamePassword = await compare(newPassword, user.password);
    if (isSamePassword) {
      return errorResponse(
        "New password must be different from current password",
        400,
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Send password changed notification email
    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Failed to send password changed email:", emailError);
      // Don't fail the request if email sending fails
    }

    return successResponse(null, "Password changed successfully");
  } catch (error: any) {
    console.error("Change password error:", error);
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return errorResponse("Internal server error", 500);
  }
}
