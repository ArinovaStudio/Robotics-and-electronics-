import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import { updateAddressSchema } from "@/app/lib/validations/address";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> },
) {
  try {
    // Get authenticated user
    const currentUser = await requireAuth();

    if (!currentUser) {
      return unauthorizedResponse();
    }

    const { addressId } = await params;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: currentUser.id,
      },
    });

    if (!existingAddress) {
      return notFoundResponse("Address not found");
    }

    const body = await request.json();

    // Validate request body
    const validation = updateAddressSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const data = validation.data;

    // If this address is set as default, unset all other default addresses
    if (data.isDefault === true) {
      await prisma.address.updateMany({
        where: {
          userId: currentUser.id,
          isDefault: true,
          id: { not: addressId },
        },
        data: { isDefault: false },
      });
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.addressLine1 && { addressLine1: data.addressLine1 }),
        ...(data.addressLine2 !== undefined && {
          addressLine2: data.addressLine2,
        }),
        ...(data.city && { city: data.city }),
        ...(data.state && { state: data.state }),
        ...(data.pincode && { pincode: data.pincode }),
        ...(data.country && { country: data.country }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        ...(data.type && { type: data.type }),
      },
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
    });

    return successResponse(updatedAddress, "Address updated successfully");
  } catch (error: any) {
    console.error("Update address error:", error);
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> },
) {
  try {
    // Get authenticated user
    const currentUser = await requireAuth();

    if (!currentUser) {
      return unauthorizedResponse();
    }

    const { addressId } = await params;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: currentUser.id,
      },
    });

    if (!existingAddress) {
      return notFoundResponse("Address not found");
    }

    // Check if address is used in any pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        addressId: addressId,
        status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
      },
    });

    if (pendingOrders > 0) {
      return errorResponse("Cannot delete address used in pending orders", 400);
    }

    const wasDefault = existingAddress.isDefault;

    // Delete address
    await prisma.address.delete({
      where: { id: addressId },
    });

    // If deleted address was default, set another as default
    if (wasDefault) {
      const remainingAddresses = await prisma.address.findFirst({
        where: { userId: currentUser.id },
        orderBy: { createdAt: "asc" },
      });

      if (remainingAddresses) {
        await prisma.address.update({
          where: { id: remainingAddresses.id },
          data: { isDefault: true },
        });
      }
    }

    return successResponse(null, "Address deleted successfully");
  } catch (error: any) {
    console.error("Delete address error:", error);
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return errorResponse("Internal server error", 500);
  }
}
