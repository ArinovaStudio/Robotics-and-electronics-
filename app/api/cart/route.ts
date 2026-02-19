import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { requireAuth } from "@/app/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/app/lib/api-response";
import { addToCartSchema } from "@/app/lib/validations/cart";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();
    const userId = user.id;

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
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
              },
            },
          },
        },
      },
    });

    // Create cart if doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
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
                },
              },
            },
          },
        },
      });
    }

    // Calculate totals
    let totalItems = 0;
    let subtotal = 0;
    let discount = 0;

    const formattedItems = cart.items.map((item) => {
      const product = item.product;
      const price = (product.price as any).value;
      const salePrice = product.salePrice
        ? (product.salePrice as any).value
        : null;

      const effectivePrice = salePrice || price;
      const itemTotal = effectivePrice * item.quantity;

      // Calculate discount for this item
      if (salePrice) {
        discount += (price - salePrice) * item.quantity;
      }

      totalItems += item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: product.id,
          title: product.title,
          link: product.link,
          imageLink: product.imageLink,
          price: product.price,
          salePrice: product.salePrice,
          availability: product.availability,
          stockQuantity: product.stockQuantity,
        },
        itemTotal,
      };
    });

    // Calculate shipping
    const freeShippingThreshold = 499;
    const eligibleForFreeShipping = subtotal >= freeShippingThreshold;
    const shippingEstimate = eligibleForFreeShipping ? 0 : 50;
    const estimatedTotal = subtotal + shippingEstimate;

    return successResponse({
      id: cart.id,
      items: formattedItems,
      summary: {
        totalItems,
        subtotal,
        discount,
        shippingEstimate,
        freeShippingThreshold,
        eligibleForFreeShipping,
        estimatedTotal,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);

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
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0]?.message || "Invalid request data",
        400,
      );
    }

    const { productId, quantity } = validation.data;

    // Validate product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        isActive: true,
        availability: true,
        stockQuantity: true,
        price: true,
        salePrice: true,
      },
    });

    if (!product) {
      return notFoundResponse("Product not found");
    }

    if (!product.isActive) {
      return errorResponse("Product is not available", 400);
    }

    // Check product availability
    if (product.availability !== "IN_STOCK") {
      return errorResponse("Product is out of stock", 400);
    }

    // Check requested quantity <= stock
    if (quantity > product.stockQuantity) {
      return errorResponse(
        `Only ${product.stockQuantity} items available in stock`,
        400,
      );
    }

    // Get or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if product already in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity (add to existing)
      const newQuantity = existingCartItem.quantity + quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > product.stockQuantity) {
        return errorResponse(
          `Cannot add ${quantity} more items. Only ${product.stockQuantity - existingCartItem.quantity} items available`,
          400,
        );
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
      });
    }

    // Calculate cart summary
    const allCartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          select: {
            price: true,
            salePrice: true,
          },
        },
      },
    });

    let totalItems = 0;
    let subtotal = 0;

    allCartItems.forEach((item) => {
      const price = (item.product.price as any).value;
      const salePrice = item.product.salePrice
        ? (item.product.salePrice as any).value
        : null;
      const effectivePrice = salePrice || price;

      totalItems += item.quantity;
      subtotal += effectivePrice * item.quantity;
    });

    return successResponse(
      {
        cartItem: {
          id: cartItem.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
        },
        cartSummary: {
          totalItems,
          subtotal,
        },
      },
      "Item added to cart",
    );
  } catch (error) {
    console.error("Add to cart error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Internal server error", 500);
  }
}
