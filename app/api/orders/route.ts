import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";
import {
  listOrdersQuerySchema,
  createOrderSchema,
} from "@/app/lib/validations/order";
import { generateOrderNumber } from "@/app/lib/order-helpers";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();
    const userId = user.id;

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      sort: searchParams.get("sort"),
    };

    const validation = listOrdersQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0]?.message || "Invalid query parameters",
        400,
      );
    }

    const { page, limit, status, sort } = validation.data;

    // Build where clause
    const where: any = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch orders with items and payment info
    const [orders, totalItems] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              quantity: true,
              priceAtPurchase: true,
              productSnapshot: true,
            },
          },
          payment: {
            select: {
              status: true,
              paymentMethod: true,
            },
          },
        },
        orderBy: {
          orderedAt: sort === "newest" ? "desc" : "asc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Format response
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      orderedAt: order.orderedAt,
      confirmedAt: order.confirmedAt,
      processedAt: order.processedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase.toString(),
        productSnapshot: item.productSnapshot,
      })),
      payment: order.payment
        ? {
            status: order.payment.status,
            paymentMethod: order.payment.paymentMethod,
          }
        : null,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return successResponse({
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    console.error("List orders error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();
    const userId = user.id;

    // Parse and validate request body
    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0]?.message || "Invalid request data",
        400,
      );
    }

    const { addressId, notes } = validation.data;

    // Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                link: true,
                imageLink: true,
                price: true,
                salePrice: true,
                availability: true,
                stockQuantity: true,
                isActive: true,
                brand: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    // Validate cart has items
    if (!cart || cart.items.length === 0) {
      return errorResponse("Cart is empty", 400);
    }

    // Validate address belongs to user
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return notFoundResponse("Address not found");
    }

    if (address.userId !== userId) {
      return errorResponse("Address does not belong to you", 403);
    }

    // Validate all products are available and in stock
    for (const item of cart.items) {
      const product = item.product;

      if (!product.isActive) {
        return errorResponse(
          `Product "${product.title}" is no longer available`,
          400,
        );
      }

      if (product.availability !== "IN_STOCK") {
        return errorResponse(`Product "${product.title}" is out of stock`, 400);
      }

      if (item.quantity > product.stockQuantity) {
        return errorResponse(
          `Insufficient stock for "${product.title}". Only ${product.stockQuantity} available`,
          400,
        );
      }
    }

    // Calculate order totals
    let subtotal = 0;
    let discount = 0;

    cart.items.forEach((item) => {
      const price = (item.product.price as any).value;
      const salePrice = item.product.salePrice
        ? (item.product.salePrice as any).value
        : null;

      const effectivePrice = salePrice || price;
      const itemTotal = effectivePrice * item.quantity;

      // Calculate discount for this item
      if (salePrice) {
        discount += (price - salePrice) * item.quantity;
      }

      subtotal += itemTotal;
    });

    // Calculate shipping (free if subtotal >= 499)
    const freeShippingThreshold = 499;
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : 50;

    // Calculate tax (18% GST on subtotal + shipping)
    const taxableAmount = subtotal + shippingCost;
    const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100;

    // Calculate total
    const totalAmount =
      Math.round((subtotal + shippingCost + taxAmount) * 100) / 100;

    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    // Begin transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          status: "PENDING",
          subtotal,
          shippingCost,
          taxAmount,
          discount,
          totalAmount,
          notes,
        },
        include: {
          address: true,
        },
      });

      // Create order items with product snapshots
      const orderItems = await Promise.all(
        cart.items.map(async (item) => {
          const product = item.product;
          const price = (product.price as any).value;
          const salePrice = product.salePrice
            ? (product.salePrice as any).value
            : null;
          const priceAtPurchase = salePrice || price;

          // Create product snapshot
          const productSnapshot = {
            title: product.title,
            link: product.link,
            imageLink: product.imageLink,
            brand: product.brand,
            sku: product.sku,
            price: product.price,
            salePrice: product.salePrice,
          };

          return tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              quantity: item.quantity,
              priceAtPurchase,
              productSnapshot,
            },
          });
        }),
      );

      // Update product stock quantities
      await Promise.all(
        cart.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      );

      // Clear user cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return { order, orderItems };
    });

    // Format response
    const formattedOrder = {
      id: result.order.id,
      orderNumber: result.order.orderNumber,
      status: result.order.status,
      subtotal: result.order.subtotal.toString(),
      shippingCost: result.order.shippingCost.toString(),
      taxAmount: result.order.taxAmount.toString(),
      discount: result.order.discount.toString(),
      totalAmount: result.order.totalAmount.toString(),
      notes: result.order.notes,
      items: result.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase.toString(),
        productSnapshot: item.productSnapshot,
      })),
      address: result.order.address,
      orderedAt: result.order.orderedAt,
    };

    return successResponse(
      {
        order: formattedOrder,
        paymentRequired: true,
      },
      "Order created successfully",
      201,
    );
  } catch (error) {
    console.error("Create order error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Internal server error", 500);
  }
}
