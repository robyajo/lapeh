import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response";
import { ACCESS_TOKEN_EXPIRES_IN_SECONDS } from "../controllers/authController";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    sendError(res, 401, "Unauthorized");
    return;
  }
  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    sendError(res, 500, "Server misconfigured");
    return;
  }
  try {
    const payload = jwt.verify(token, secret) as {
      userId: string;
      role: string;
    };
    (req as any).user = { userId: payload.userId, role: payload.role };

    const accessExpiresInSeconds = ACCESS_TOKEN_EXPIRES_IN_SECONDS;
    const accessExpiresAt = new Date(
      Date.now() + accessExpiresInSeconds * 1000
    ).toISOString();
    const newToken = jwt.sign(
      { userId: payload.userId, role: payload.role },
      secret,
      { expiresIn: accessExpiresInSeconds }
    );
    res.setHeader("x-access-token", newToken);
    res.setHeader("x-access-expires-at", accessExpiresAt);

    next();
  } catch {
    sendError(res, 401, "Invalid token");
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as
    | { userId: string; role: string }
    | undefined;
  if (!user) {
    sendError(res, 401, "Unauthorized");
    return;
  }
  if (user.role !== "admin" && user.role !== "super_admin") {
    sendError(res, 403, "Forbidden");
    return;
  }
  next();
}
