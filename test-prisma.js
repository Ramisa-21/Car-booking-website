const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  console.log("Prisma keys:", Object.keys(prisma));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
