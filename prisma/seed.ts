import prisma from "@/app/lib/db";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

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
  console.log(`✅ Admin user created: ${admin.email}`);
  console.log(`📧 Email: admin@gmail.com`);
  console.log(`🔑 Password: password123`);

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
