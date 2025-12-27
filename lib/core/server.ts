import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
// import { apiRouter } from "@/routes"; // Routes are now loaded dynamically in bootstrap.ts
import { visitorCounter } from "../middleware/visitor";
// import { errorHandler } from "../middleware/error";
import { apiLimiter } from "../middleware/rateLimit";
import { requestLogger } from "../middleware/requestLogger";
import { sendSuccess } from "../utils/response";

export const app = express();

app.disable("x-powered-by");

// Compression (Gzip)
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

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disarankan true jika menggunakan frontend di domain yang sama
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

// Logging & Parsing
app.use(requestLogger);
app.use(express.json({ limit: "10mb" })); // Limit dinaikkan untuk upload file base64/besar
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting (Global)
app.use(apiLimiter);

app.use(visitorCounter);

// Health Check Endpoint
app.get("/", (_req: Request, res: Response) => {
  sendSuccess(res, 200, "Lapeh API is running", {
    status: "active",
    timestamp: new Date(),
    version: process.env.npm_package_version || "2.1.6",
  });
});

// Routes are loaded in bootstrap.ts via app.use('/api', userApiRouter)

// Global Error Handler
// Note: We don't attach error handler here because we want to attach it AFTER routes are loaded in bootstrap
// app.use(errorHandler);
