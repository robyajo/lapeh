import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./routes/auth";
import { rbacRouter } from "./routes/rbac";
import { visitorCounter } from "./middleware/visitor";
import { errorHandler } from "./middleware/error";

export const app = express();

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
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
app.use(express.json({ limit: "1mb" }));
app.use(visitorCounter);

app.use("/api/auth", authRouter);
app.use("/api/rbac", rbacRouter);

app.use(errorHandler);
