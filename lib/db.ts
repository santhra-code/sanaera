import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/app/generated/prisma/client";

// Prevent multiple Prisma Client instances during Next.js dev hot-reloading.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Uses Neon's HTTPS/WebSocket-based serverless driver instead of a raw
  // TCP connection. This avoids issues where local firewalls, antivirus
  // software, or restrictive networks interfere with long-lived
  // PostgreSQL TCP connections on port 5432.
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}