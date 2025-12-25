import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const url = process.env.DATABASE_URL || "";
const provider = (process.env.DATABASE_PROVIDER || "").toLowerCase();

let prisma: PrismaClient;

if (provider === "postgresql" || url.startsWith("postgres")) {
  const adapter = new PrismaPg({ connectionString: url });
  prisma = new PrismaClient({ adapter });
} else if (
  provider === "mysql" ||
  provider === "mariadb" ||
  url.startsWith("mysql") ||
  url.startsWith("mariadb")
) {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  } as any);
  prisma = new PrismaClient({ adapter });
} else {
  throw new Error(
    'Unsupported DATABASE_PROVIDER. Use "postgresql" or "mysql".'
  );
}

export { prisma };
