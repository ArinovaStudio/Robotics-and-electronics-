import prisma from "@/lib/prisma";
import { Role, OrderStatus, PaymentStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Arnav", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Advait", "Pranav", "Dhruv", "Ananya", "Diya", "Aadhya", "Saanvi", "Anvi", "Pari", "Navya", "Angel", "Aarohi", "Kiara", "Priya", "Riya", "Sneha", "Pooja", "Neha", "Rahul", "Rohan", "Amit", "Raj", "Vikram", "Karan", "Nikhil", "Varun", "Harsh", "Yash", "Kavya", "Ishita", "Tanvi", "Shreya", "Aisha", "Meera", "Sanya", "Tara", "Zara", "Myra"];
const lastNames = ["Sharma", "Verma", "Patel", "Kumar", "Singh", "Gupta", "Reddy", "Joshi", "Mehta", "Nair", "Iyer", "Rao", "Desai", "Kulkarni", "Agarwal", "Bansal", "Malhotra", "Kapoor", "Chopra", "Bhatia", "Saxena", "Jain", "Arora", "Sinha", "Pandey", "Mishra", "Tiwari", "Dubey", "Yadav", "Chauhan"];

async function main() {
  console.log("Starting database seeding...");

  const hashedPassword = await hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
      phone: "9876543210",
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  const users = [];
  
  for (let i = 1; i <= 55; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const phone = `${9000000000 + Math.floor(Math.random() * 999999999)}`;
    const isVerified = Math.random() > 0.3;
    
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: Role.CUSTOMER,
          emailVerified: isVerified ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) : null,
          phone,
          createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        },
      });
      users.push(user);
      if (i % 10 === 0) console.log(`   Created ${i} users...`);
    } catch (error) {
      console.log(`   Skipped duplicate: ${email}`);
    }
  }

  console.log(`\Created ${users.length} customer users`);

  // Get all products
  const products = await prisma.product.findMany({ where: { isActive: true } });
  if (products.length === 0) {
    return;
  }

  // Create orders
  console.log("\nCreating orders...");
  const statuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];
  const states = ["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "West Bengal", "Maharashtra", "Gujarat"];
  let orderCount = 0;

  for (let i = 0; i < 75; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const orderProducts = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = typeof product.price === 'object' && product.price !== null ? (product.price as any).value : 1000;
      orderProducts.push({ product, quantity, price });
      subtotal += price * quantity;
    }

    const shippingCost = subtotal > 5000 ? 0 : 100;
    const taxAmount = subtotal * 0.18;
    const totalAmount = subtotal + shippingCost + taxAmount;
    const createdAt = new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000);

    try {
      const address = await prisma.address.create({
        data: {
          userId: user.id,
          name: user.name,
          phone: user.phone || "9000000000",
          addressLine1: `${Math.floor(Math.random() * 999) + 1}, Street ${Math.floor(Math.random() * 50) + 1}`,
          city: cities[Math.floor(Math.random() * cities.length)],
          state: states[Math.floor(Math.random() * states.length)],
          pincode: `${400000 + Math.floor(Math.random() * 99999)}`,
          isDefault: true,
        },
      });

      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
          userId: user.id,
          addressId: address.id,
          status,
          subtotal,
          shippingCost,
          taxAmount,
          totalAmount,
          createdAt,
          orderedAt: createdAt,
          confirmedAt: status !== OrderStatus.PENDING ? new Date(createdAt.getTime() + 3600000) : null,
          deliveredAt: status === OrderStatus.DELIVERED ? new Date(createdAt.getTime() + 7 * 24 * 3600000) : null,
          items: {
            create: orderProducts.map(op => ({
              productId: op.product.id,
              quantity: op.quantity,
              priceAtPurchase: op.price,
              productSnapshot: op.product,
            })),
          },
          payment: {
            create: {
              razorpayOrderId: `order_${Date.now()}${Math.floor(Math.random() * 10000)}`,
              razorpayPaymentId: status !== OrderStatus.PENDING ? `pay_${Date.now()}${Math.floor(Math.random() * 10000)}` : null,
              amount: totalAmount,
              status: status === OrderStatus.CANCELLED ? PaymentStatus.FAILED : status === OrderStatus.PENDING ? PaymentStatus.PENDING : PaymentStatus.SUCCESS,
              paymentMethod: ["card", "upi", "netbanking"][Math.floor(Math.random() * 3)],
            },
          },
        },
      });
      orderCount++;
      if (orderCount % 15 === 0) console.log(`   Created ${orderCount} orders...`);
    } catch (error) {
      console.log(`   Failed to create order for ${user.email}`);
    }
  }

  console.log(`\nCreated ${orderCount} orders`);
  console.log(`Email: admin@gmail.com`);
  console.log(`Password: password123 (for all users)`);
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
