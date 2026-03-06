import { Role, OrderStatus, PaymentStatus, ProductAvailability, ProductCondition } from "@prisma/client";
import { hash } from "bcryptjs";
import developmentBoards from "./data/boards";
import sensorsCategory from "./data/sensors";
import motorsCategory from "./data/motors";
import powerSupplyCategory from "./data/power";
import diyKitsCategory from "./data/kits";
import basicCategory from "./data/basics";
import prisma from "@/lib/prisma";

function generateSlug(text: string) {
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

async function main() {
  console.log("Starting database cleanup...");

  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productFaq.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.account.deleteMany();
  await prisma.otpToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleared successfully. Starting seeding...");

  const hashedPassword = await hash("password123", 10);

  console.log("Creating Admin & Customers...");
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
      phone: "9876543210",
    },
  });

  const users = await Promise.all([
    prisma.user.create({ data: { name: "Rahul Sharma", email: "rahul@example.com", password: hashedPassword, role: Role.CUSTOMER, phone: "9000000001", emailVerified: new Date() } }),
    prisma.user.create({ data: { name: "Priya Patel", email: "priya@example.com", password: hashedPassword, role: Role.CUSTOMER, phone: "9000000002", emailVerified: new Date() } }),
    prisma.user.create({ data: { name: "Amit Kumar", email: "amit@example.com", password: hashedPassword, role: Role.CUSTOMER, phone: "9000000003", emailVerified: new Date() } }),
  ]);

  console.log("Creating Categories, Subcategories, and Products...");

  const catalogData = [
    developmentBoards,
    sensorsCategory,
    motorsCategory,
    powerSupplyCategory,
    diyKitsCategory,
    basicCategory
  ];

  const createdProducts = [];

  for (const catalog of catalogData) {
    // Create Parent Category
    const parentCategory = await prisma.category.create({
      data: {
        name: catalog.parent.name,
        slug: generateSlug(catalog.parent.name),
        description: catalog.parent.description,
      }
    });

    for (const sub of catalog.subcategories) {
      // Create Subcategory linked to Parent
      const subCategory = await prisma.category.create({
        data: {
          name: sub.name,
          slug: generateSlug(sub.name),
          parentId: parentCategory.id,
        }
      });

      // Create Products linked to Subcategory
      for (const prod of sub.products) {
        const product = await prisma.product.create({
          data: {
            title: prod.title,
            description: `High quality ${prod.title}. Perfect for your DIY electronics and robotics projects.`,
            link: `${generateSlug(prod.title)}-${generateSlug(prod.sku)}`,
            imageLink: `https://dummyimage.com/400x400/cccccc/000000&text=${encodeURIComponent(prod.sku)}`,
            additionalImageLinks: [],
            price: prod.price,
            salePrice: prod.salePrice,
            sku: prod.sku,
            brand: "Generic",
            condition: ProductCondition.NEW,
            categoryId: subCategory.id, 
            availability: ProductAvailability.IN_STOCK,
            stockQuantity: Math.floor(Math.random() * 50) + 10,
            productHighlights: ["Easy to use", "Durable", "Perfect for DIY"],
            productDetails: [],
          }
        });
        createdProducts.push(product);
      }
    }
  }

  console.log("Creating 5 Orders for random users...");
  const cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"];
  const states = ["Maharashtra", "Delhi", "Karnataka", "Maharashtra", "Telangana"];
  
  for (let i = 0; i < 5; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        name: user.name,
        phone: user.phone || "9000000000",
        addressLine1: `${Math.floor(Math.random() * 100) + 1}, Tech Park`,
        city: cities[i],
        state: states[i],
        pincode: `40000${i}`,
        isDefault: true,
      },
    });

    // Pick 2 random products for the order
    const orderProducts = [
      createdProducts[Math.floor(Math.random() * createdProducts.length)],
      createdProducts[Math.floor(Math.random() * createdProducts.length)]
    ];

    let subtotal = 0;
    let discount = 0;

    const itemsData = orderProducts.map(prod => {
      const quantity = Math.floor(Math.random() * 2) + 1;
      const originalPrice = Number(prod.price);
      const salePrice = Number(prod.salePrice || prod.price);
      
      subtotal += originalPrice * quantity;
      discount += (originalPrice - salePrice) * quantity;
      
      return {
        productId: prod.id,
        quantity: quantity,
        priceAtPurchase: salePrice,
        productSnapshot: { title: prod.title, sku: prod.sku, image: prod.imageLink },
      };
    });
    
    const totalAmount = subtotal - discount;
    
    await prisma.order.create({
      data: {
        orderNumber: `ORD${Date.now()}${i}`,
        userId: user.id,
        addressId: address.id,
        status: OrderStatus.DELIVERED,
        subtotal: subtotal,
        totalAmount: totalAmount,
        discount: discount,
        confirmedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        shippedAt: new Date(Date.now() - 86400000 * 2),   // 2 days ago
        deliveredAt: new Date(),
        items: { create: itemsData },
        payment: {
          create: {
            razorpayOrderId: `order_${Date.now()}${i}`,
            razorpayPaymentId: `pay_${Date.now()}${i}`,
            amount: totalAmount,
            status: PaymentStatus.SUCCESS,
            paymentMethod: "upi",
          },
        },
      },
    });
  }

  console.log("\nSeeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });