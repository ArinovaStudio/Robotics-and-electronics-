import prisma from "@/app/lib/db";
import { Role, OrderStatus, PaymentStatus } from "@prisma/client";
import { hash } from "bcryptjs";

async function main() {
  console.log("Starting database seeding...");

  const hashedPassword = await hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@ezmart.com",
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
      phone: "9876543210",
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create Customers
  const customers = [];
  const customerData = [
    {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "9876500001",
      verified: true,
    },
    {
      name: "Priya Patel",
      email: "priya@example.com",
      phone: "9876500002",
      verified: true,
    },
    {
      name: "Amit Kumar",
      email: "amit@example.com",
      phone: "9876500003",
      verified: false,
    },
  ];

  for (const c of customerData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        password: hashedPassword,
        role: Role.CUSTOMER,
        emailVerified: c.verified ? new Date() : null,
        phone: c.phone,
      },
    });
    customers.push(user);

    await prisma.address.create({
      data: {
        userId: user.id,
        name: user.name,
        phone: user.phone || "9999999999",
        addressLine1: "123 Main Street",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110001",
        isDefault: true,
      },
    });
  }
  console.log(`${customers.length} Customers and Addresses created`);

  // Create a Category & Products (Needed for Orders)
  const electronicsCategory = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Gadgets and gear",
      isActive: true,
      sortOrder: 1,
    },
  });

  const product1 = await prisma.product.upsert({
    where: { sku: "PROD-MOUSE-01" },
    update: {},
    create: {
      title: "Logitech G Pro Wireless",
      description: "High-end gaming mouse",
      link: "logitech-g-pro-wireless",
      imageLink: "/uploads/dummy-mouse.jpg",
      additionalImageLinks: [],
      price: { value: 12000, currency: "INR" },
      stockQuantity: 50,
      sku: "PROD-MOUSE-01",
      brand: "Logitech",
      categoryId: electronicsCategory.id,
      productDetails: [],
      productHighlights: ["Lightweight", "Hero Sensor"],
    },
  });

  const product2 = await prisma.product.upsert({
    where: { sku: "PROD-KB-01" },
    update: {},
    create: {
      title: "Keychron K2 Mechanical Keyboard",
      description: "Wireless mechanical keyboard",
      link: "keychron-k2",
      imageLink: "/uploads/dummy-kb.jpg",
      additionalImageLinks: [],
      price: { value: 8500, currency: "INR" },
      stockQuantity: 20,
      sku: "PROD-KB-01",
      brand: "Keychron",
      categoryId: electronicsCategory.id,
      productDetails: [],
      productHighlights: ["Hot-swappable", "RGB"],
    },
  });
  console.log(`Products created`);

  const rahulAddress = await prisma.address.findFirst({
    where: { userId: customers[0].id },
  });
  const priyaAddress = await prisma.address.findFirst({
    where: { userId: customers[1].id },
  });

  if (rahulAddress && priyaAddress) {
    // Order 1: Delivered (Rahul)
    await prisma.order.create({
      data: {
        orderNumber: "ORD-2026-001",
        userId: customers[0].id,
        addressId: rahulAddress.id,
        status: OrderStatus.DELIVERED,
        subtotal: 12000,
        shippingCost: 0,
        taxAmount: 2160,
        discount: 0,
        totalAmount: 14160,
        orderedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        deliveredAt: new Date(),
        items: {
          create: [
            {
              productId: product1.id,
              quantity: 1,
              priceAtPurchase: 12000,
              productSnapshot: {
                title: product1.title,
                image: product1.imageLink,
              },
            },
          ],
        },
        payment: {
          create: {
            razorpayOrderId: "order_dummy1",
            amount: 14160,
            status: PaymentStatus.SUCCESS,
            paymentMethod: "UPI",
            vpa: "rahul@okicici",
            paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    // Order 2: Processing (Priya)
    await prisma.order.create({
      data: {
        orderNumber: "ORD-2026-002",
        userId: customers[1].id,
        addressId: priyaAddress.id,
        status: OrderStatus.PROCESSING,
        subtotal: 20500, // 1 mouse + 1 KB
        shippingCost: 100,
        taxAmount: 3690,
        discount: 500,
        totalAmount: 23790,
        orderedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        items: {
          create: [
            {
              productId: product1.id,
              quantity: 1,
              priceAtPurchase: 12000,
              productSnapshot: {
                title: product1.title,
                image: product1.imageLink,
              },
            },
            {
              productId: product2.id,
              quantity: 1,
              priceAtPurchase: 8500,
              productSnapshot: {
                title: product2.title,
                image: product2.imageLink,
              },
            },
          ],
        },
        payment: {
          create: {
            razorpayOrderId: "order_dummy2",
            amount: 23790,
            status: PaymentStatus.SUCCESS,
            paymentMethod: "card",
            cardNetwork: "Visa",
            cardLast4: "4242",
            paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });
    console.log(`Dummy Orders & Payments created`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
