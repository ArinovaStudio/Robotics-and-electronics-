import prisma from "@/app/lib/db";

/**
 * Generate a unique order number in format: ORD-YYYY-XXXX
 */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  // Get count of orders for this year
  const startOfYear = new Date(year, 0, 1);
  const ordersThisYear = await prisma.order.count({
    where: {
      orderedAt: {
        gte: startOfYear,
      },
    },
  });

  // Generate next number (zero-padded to 4 digits)
  const nextNumber = (ordersThisYear + 1).toString().padStart(4, "0");

  return `${prefix}${nextNumber}`;
}
