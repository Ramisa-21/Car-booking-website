import { PrismaClient } from "@prisma/client";

// This ensures the PrismaClient is reused in dev (hot reload),
// and freshly created in production.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ✅ default export so you can `import prisma from "...lib/prisma"`
export default prisma;

