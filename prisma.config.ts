import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: "ts-node -r tsconfig-paths/register prisma/seed.ts",
  },
});
