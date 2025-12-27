import { Router } from "express";
import { authRouter } from "@/routes/auth";
import { rbacRouter } from "@/routes/rbac";
import petRouter from "@/routes/pets";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/rbac", rbacRouter);
apiRouter.use("/pets", petRouter);
