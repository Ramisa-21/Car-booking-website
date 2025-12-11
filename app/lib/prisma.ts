// ./lib/prisma.ts (TypeScript)

import { PrismaClient } from "@prisma/client";

// 1. Declare a global variable to hold the Prisma Client instance
// This prevents creating a new client on every hot reload in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 2. Use the existing instance or create a new one
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// 3. In development, store the instance on the global object
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
