import prisma from "@/lib/prisma";
import { Role, OrderStatus, PaymentStatus, ProductAvailability, ProductCondition } from "@prisma/client";
import { hash } from "bcryptjs";

async function main() {
  console.log("Starting database seeding...");

  const hashedPassword = await hash("password123", 10);

  console.log("Creating Admin...");
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

  console.log("Creating 3 Customers...");
  const users = await Promise.all([
    prisma.user.create({ data: { name: "Rahul Sharma", email: "rahul@example.com", password: hashedPassword, role: Role.CUSTOMER, phone: "9000000001" } }),
    prisma.user.create({ data: { name: "Priya Patel", email: "priya@example.com", password: hashedPassword, role: Role.CUSTOMER, phone: "9000000002" } }),
    prisma.user.create({ data: { name: "Amit Kumar", email: "amit@example.com", password: hashedPassword, role: Role.CUSTOMER, phone: "9000000003" } }),
  ]);

  console.log("Creating 4 Categories...");
  const categoriesData = [
    { name: "Microcontrollers", slug: "microcontrollers", description: "Arduino, Raspberry Pi, and more." },
    { name: "Sensors", slug: "sensors", description: "Distance, temperature, and motion sensors." },
    { name: "Motors & Drivers", slug: "motors", description: "DC motors, servos, and motor drivers." },
    { name: "Power Supply", slug: "power", description: "Batteries, adapters, and power modules." },
  ];
  const categories = await Promise.all(
    categoriesData.map(c => prisma.category.create({ data: c }))
  );

  console.log("Creating 10 Products...");
  const productsData = [
    { catIdx: 0, title: "Arduino Uno R3", sku: "MCU-001", price: 1200, salePrice: 999 },
    { catIdx: 0, title: "Raspberry Pi 4 Model B", sku: "MCU-002", price: 4500, salePrice: null },
    { catIdx: 0, title: "ESP32 NodeMCU", sku: "MCU-003", price: 450, salePrice: 399 },
    { catIdx: 1, title: "Ultrasonic Sensor HC-SR04", sku: "SEN-001", price: 150, salePrice: 99 },
    { catIdx: 1, title: "PIR Motion Sensor", sku: "SEN-002", price: 180, salePrice: null },
    { catIdx: 1, title: "DHT11 Temperature Sensor", sku: "SEN-003", price: 120, salePrice: 110 },
    { catIdx: 2, title: "L298N Motor Driver", sku: "MOT-001", price: 250, salePrice: 199 },
    { catIdx: 2, title: "BO Motor (150 RPM)", sku: "MOT-002", price: 80, salePrice: null },
    { catIdx: 2, title: "SG90 Micro Servo Motor", sku: "MOT-003", price: 130, salePrice: null },
    { catIdx: 3, title: "12V 2A Power Adapter", sku: "POW-001", price: 350, salePrice: 299 },
  ];

  const products = await Promise.all(
    productsData.map(p => {
      const categoryId = categories[p.catIdx].id;
      return prisma.product.create({
        data: {
          title: p.title,
          description: `High quality ${p.title} for your electronics projects.`,
          link: p.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          imageLink: `https://via.placeholder.com/400x400.png?text=${p.sku}`,
          additionalImageLinks: [],
          price: p.price,
          salePrice: p.salePrice,
          sku: p.sku,
          brand: "Generic",
          condition: ProductCondition.NEW,
          categoryId: categoryId,
          availability: ProductAvailability.IN_STOCK,
          stockQuantity: Math.floor(Math.random() * 50) + 10,
          productHighlights: ["Easy to use", "Durable", "Perfect for DIY"],
          productDetails: [],
        }
      });
    })
  );

  console.log("Creating 5 Orders...");
  const cities = ["Mumbai", "Delhi", "Bangalore"];
  const states = ["Maharashtra", "Delhi", "Karnataka"];
  
  for (let i = 0; i < 5; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        name: user.name,
        phone: user.phone || "9000000000",
        addressLine1: `${Math.floor(Math.random() * 100) + 1}, Tech Park`,
        city: cities[Math.floor(Math.random() * cities.length)],
        state: states[Math.floor(Math.random() * states.length)],
        pincode: `40000${i}`,
        isDefault: true,
      },
    });

    const orderProducts = [
      products[Math.floor(Math.random() * products.length)],
      products[Math.floor(Math.random() * products.length)]
    ];

    let subtotal = 0;
    const itemsData = orderProducts.map(prod => {
      const quantity = Math.floor(Math.random() * 2) + 1;
      const price = Number(prod.salePrice || prod.price);
      subtotal += price * quantity;
      
      return {
        productId: prod.id,
        quantity: quantity,
        priceAtPurchase: price,
        productSnapshot: { title: prod.title, sku: prod.sku, image: prod.imageLink },
      };
    });

    const shippingCost = subtotal > 1000 ? 0 : 50;
    const taxAmount = subtotal * 0.18;
    const totalAmount = subtotal + shippingCost + taxAmount;
    
    await prisma.order.create({
      data: {
        orderNumber: `ORD${Date.now()}${i}`,
        userId: user.id,
        addressId: address.id,
        status: OrderStatus.CONFIRMED,
        subtotal: subtotal,
        shippingCost: shippingCost,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        confirmedAt: new Date(),
        items: {
          create: itemsData,
        },
        payment: {
          create: {
            razorpayOrderId: `order_${Date.now()}${i}`,
            razorpayPaymentId: `pay_${Date.now()}${i}`,
            amount: totalAmount,
            status: PaymentStatus.SUCCESS,
            paymentMethod: "card",
          },
        },
      },
    });
  }

  console.log("\nSeeding completed successfully!");
  console.log(`Admin Email: admin@gmail.com`);
  console.log(`Password: password123 (for all users)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
