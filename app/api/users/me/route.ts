import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import { updateUserSchema } from "@/app/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/app/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const currentUser = await requireAuth();

    if (!currentUser) {
      return unauthorizedResponse();
    }

    // Fetch user with addresses
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          select: {
            id: true,
            name: true,
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            pincode: true,
            country: true,
            isDefault: true,
            type: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user);
  } catch (error: any) {
    console.error("Get current user error:", error);
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get authenticated user
    const currentUser = await requireAuth();

    if (!currentUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const { name, phone, image } = validation.data;

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (image !== undefined) updateData.image = image;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
      },
    });

    return successResponse(updatedUser, "Profile updated successfully");
  } catch (error: any) {
    console.error("Update user error:", error);
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return errorResponse("Internal server error", 500);
  }
}
