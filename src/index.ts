import dotenv from "dotenv";
dotenv.config();

// Validasi Environment Variables
const requiredEnvs = ["DATABASE_URL", "JWT_SECRET"];
const missingEnvs = requiredEnvs.filter((key) => !process.env[key]);
if (missingEnvs.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnvs.join(", ")}`
  );
  process.exit(1);
}

import { app } from "./core/server";
import http from "http";
import { initRealtime } from "./core/realtime";
import { initRedis, redis } from "./core/redis"; // Pastikan redis diexport di redis.ts
import { prisma } from "./core/database";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const server = http.createServer(app);

initRealtime(server);

const startServer = async () => {
  try {
    // Initialize Redis transparently (no logs if missing)
    await initRedis();

    server.listen(port, () => {
      console.log(`✅ API running at http://localhost:${port}`);
      console.log(`🛡️  Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\n🛑 ${signal} received. Closing resources...`);

  server.close(() => {
    console.log("Http server closed.");
  });

  try {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");

    // Jika redis object available, disconnect
    if (redis && redis.status === "ready") {
      await redis.quit();
      console.log("Redis disconnected.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Menangani Uncaught Exceptions (Error sinkron yang tidak tertangkap)
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  // Disarankan untuk restart process di production (gunakan PM2 atau Docker)
  shutdown("uncaughtException");
});

// Menangani Unhandled Rejection (Promise yang reject tapi tidak di-catch)
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // Log error tapi jangan matikan server jika tidak kritikal, atau shutdown jika perlu
});
