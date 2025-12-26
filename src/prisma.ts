import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const url = process.env.DATABASE_URL || "";
const provider = (process.env.DATABASE_PROVIDER || "").toLowerCase();

let prisma: PrismaClient;

if (provider === "postgresql" || url.startsWith("postgres")) {
  const adapter = new PrismaPg({ connectionString: url });
  prisma = new PrismaClient({ adapter });
} else {
  if (provider === "mysql" || url.startsWith("mysql")) {
    try {
      const u = new URL(url);
      const adapter = new PrismaMariaDb({
        host: u.hostname,
        port: Number(u.port || "3306"),
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.replace("/", ""),
      } as any);
      prisma = new PrismaClient({ adapter });
    } catch {
      prisma = new PrismaClient({});
    }
  } else {
    prisma = new PrismaClient({});
  }
}

export { prisma };
