import dotenv from "dotenv";
dotenv.config();

import moduleAlias from "module-alias";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import http from "http";
import path from "path";
import { initRealtime } from "./core/realtime";
import { initRedis, redis } from "./core/redis";
import { prisma } from "./core/database";
import { visitorCounter } from "./middleware/visitor";
import { errorHandler } from "./middleware/error";
import { apiLimiter } from "./middleware/rateLimit";
import { requestLogger } from "./middleware/requestLogger";
import { sendSuccess } from "./utils/response";

export async function bootstrap() {
  // Register aliases for production runtime
  // Since user code (compiled JS) uses require('@lapeh/...')
  // We map '@lapeh' to the directory containing this file (lib/ or dist/lib/)
  moduleAlias.addAlias("@lapeh", __dirname);

  // Validasi Environment Variables
  const requiredEnvs = ["DATABASE_URL", "JWT_SECRET"];
  const missingEnvs = requiredEnvs.filter((key) => !process.env[key]);
  if (missingEnvs.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missingEnvs.join(", ")}`
    );
    process.exit(1);
  }

  const app = express();

  app.disable("x-powered-by");
  app.use(compression());

  // Request Timeout Middleware (30s)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setTimeout(30000, () => {
      res.status(408).send({
        status: "error",
        message: "Request Timeout (30s limit)",
      });
    });
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  const corsOrigin = process.env.CORS_ORIGIN || "*";
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
      exposedHeaders: ["x-access-token", "x-access-expires-at"],
    })
  );

  app.use(requestLogger);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(apiLimiter);
  app.use(visitorCounter);

  // Health Check
  app.get("/", (_req: Request, res: Response) => {
    sendSuccess(res, 200, "Lapeh API is running", {
      status: "active",
      timestamp: new Date(),
      version: process.env.npm_package_version || "unknown",
    });
  });

  // DYNAMIC ROUTE LOADING
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const userRoutesPath = isProduction
      ? path.join(process.cwd(), "dist", "src", "routes")
      : path.join(process.cwd(), "src", "routes");

    // Gunakan require agar sinkron dan mudah dicatch
    const { apiRouter } = require(userRoutesPath);
    app.use("/api", apiRouter);
    console.log(
      `✅ User routes loaded successfully from ${
        isProduction ? "dist/" : ""
      }src/routes`
    );
  } catch (error) {
    console.warn(
      "⚠️  Could not load user routes. Make sure you export 'apiRouter'."
    );
    console.error(error);
  }

  app.use(errorHandler);

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  const server = http.createServer(app);

  initRealtime(server);

  try {
    await initRedis();

    server.on("error", (e: any) => {
      if (e.code === "EADDRINUSE") {
        console.log(`\n❌ Error: Port ${port} is already in use.`);
        process.exit(1);
      }
    });

    server.listen(port, () => {
      console.log(`✅ API running at http://localhost:${port}`);
      console.log(`🛡️  Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 ${signal} received. Closing resources...`);
    server.close(() => console.log("Http server closed."));
    try {
      await prisma.$disconnect();
      if (redis && redis.status === "ready") await redis.quit();
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    shutdown("uncaughtException");
  });
}

// Self-executing if run directly
if (require.main === module) {
  bootstrap();
}
