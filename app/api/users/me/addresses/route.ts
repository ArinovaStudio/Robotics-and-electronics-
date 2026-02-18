import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import { createAddressSchema } from "@/app/lib/validations/address";
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

    // Fetch user addresses
    const addresses = await prisma.address.findMany({
      where: { userId: currentUser.id },
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
    });

    return successResponse(addresses);
  } catch (error: any) {
    console.error("Get addresses error:", error);
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const currentUser = await requireAuth();

    if (!currentUser) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate request body
    const validation = createAddressSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationErrorResponse(formattedErrors);
    }

    const data = validation.data;

    // If this address is set as default, unset all other default addresses
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: currentUser.id,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        userId: currentUser.id,
        name: data.name,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        isDefault: data.isDefault,
        type: data.type,
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

    return successResponse(address, "Address added successfully", 201);
  } catch (error: any) {
    console.error("Create address error:", error);
    if (error.message === "Unauthorized") {
      return unauthorizedResponse();
    }
    return errorResponse("Internal server error", 500);
  }
}
