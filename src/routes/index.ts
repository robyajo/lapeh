import { Router } from "express";
import { authRouter } from "./auth";
import { rbacRouter } from "./rbac";
import petRouter from "./pets";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/rbac", rbacRouter);
apiRouter.use("/pets", petRouter);
