import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ take: 3 });
  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
