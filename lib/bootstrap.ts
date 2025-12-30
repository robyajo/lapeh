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
import { visitorCounter } from "./middleware/visitor";
import { errorHandler } from "./middleware/error";
import { apiLimiter } from "./middleware/rateLimit";
import { requestLogger } from "./middleware/requestLogger";
import { sendSuccess } from "./utils/response";

export async function createApp() {
  // Register aliases for production runtime
  // Since user code (compiled JS) uses require('@lapeh/...')
  // We map '@lapeh' to the directory containing this file (lib/ or dist/lib/)
  moduleAlias.addAlias("@lapeh", __dirname);

  // Register alias for src directory (@/) to support imports in controllers/routes
  const isProduction = process.env.NODE_ENV === "production";
  moduleAlias.addAlias(
    "@",
    isProduction
      ? path.join(process.cwd(), "dist", "src")
      : path.join(process.cwd(), "src")
  );

  // LOAD USER CONFIG
  const configPath = isProduction
    ? path.join(process.cwd(), "dist", "src", "config")
    : path.join(process.cwd(), "src", "config");

  let appConfig: any = { timeout: 30000, jsonLimit: "10mb" };
  let corsConfig: any = {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    exposedHeaders: ["x-access-token", "x-access-expires-at"],
  };

  try {
    const appConfModule = require(path.join(configPath, "app"));
    if (appConfModule.appConfig)
      appConfig = { ...appConfig, ...appConfModule.appConfig };
  } catch (e) {
    // ignore
  }

  try {
    const corsConfModule = require(path.join(configPath, "cors"));
    if (corsConfModule.corsConfig)
      corsConfig = { ...corsConfig, ...corsConfModule.corsConfig };
  } catch (e) {
    // ignore
  }

  const app = express();

  app.disable("x-powered-by");
  app.use(compression());

  // Request Timeout Middleware
  app.use((_req: Request, res: Response, next: NextFunction) => {
    const timeout = appConfig.timeout || 30000;
    res.setTimeout(timeout, () => {
      res.status(408).send({
        status: "error",
        message: `Request Timeout (${timeout / 1000}s limit)`,
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

  app.use(cors(corsConfig));

  app.use(requestLogger);
  app.use(express.json({ limit: appConfig.jsonLimit || "10mb" }));
  app.use(
    express.urlencoded({ extended: true, limit: appConfig.jsonLimit || "10mb" })
  );
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
    console.log("BOOTSTRAP: Loading routes. NODE_ENV=", process.env.NODE_ENV);
    const isProduction = process.env.NODE_ENV === "production";
    let userRoutesPath = isProduction
      ? path.join(process.cwd(), "dist", "src", "routes")
      : path.join(process.cwd(), "src", "routes");

    // In test environment, explicitly point to index to ensure resolution
    if (process.env.NODE_ENV === "test") {
      // In test environment (ts-jest), we need to point to the TS file
      // And we might need to use the full path with extension
      userRoutesPath = path.join(process.cwd(), "src", "routes", "index.ts");
    }

    // Gunakan require agar sinkron dan mudah dicatch
    // Check if file exists before requiring to avoid crash in tests/clean env
    try {
      const { apiRouter } = require(userRoutesPath);
      app.use("/api", apiRouter);
    } catch (e) {
      // If it's just missing module, maybe we are in test mode or fresh install
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          `⚠️  Could not load user routes from ${userRoutesPath}. (This is expected during initial setup or if src/routes is missing)`
        );
      } else {
        // In test mode, we really want to know if it failed to load
        console.error(
          `Error loading routes in test mode from ${userRoutesPath}:`,
          e
        );
        throw e;
      }
    }
  } catch (error) {
    console.error(error);
    if (process.env.NODE_ENV === "test") throw error;
  }

  app.use(errorHandler);

  return app;
}

export async function bootstrap() {
  // Validasi Environment Variables
  const requiredEnvs = ["JWT_SECRET"];
  const missingEnvs = requiredEnvs.filter((key) => !process.env[key]);
  if (missingEnvs.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missingEnvs.join(", ")}`
    );
    process.exit(1);
  }

  const app = await createApp();
  const port = process.env.PORT ? Number(process.env.PORT) : 8000;
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
