import { Router } from "express";
import { authRouter } from "@/routes/auth";
import { rbacRouter } from "@/routes/rbac";
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/rbac", rbacRouter);
