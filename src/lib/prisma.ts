import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma";
import path from "node:path";

// Singleton pattern — prevents too many connections in Next.js dev hot-reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const raw = process.env.DATABASE_URL ?? "file:./dev.db";
  const dbPath = raw.replace(/^file:/, "");
  const absolute = path.isAbsolute(dbPath)
    ? dbPath
    : path.resolve(process.cwd(), dbPath);
  const adapter = new PrismaBetterSqlite3({ url: absolute });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
