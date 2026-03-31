import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = globalThis.__blogPrisma ?? new PrismaClient({
  adapter,
});

if (process.env.NODE_ENV !== "production") {
  globalThis.__blogPrisma = prisma;
}