import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { sendError } from "../utils/response";
import { Log } from "../utils/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return sendError(res, 400, "Validation Error", formattedErrors);
  }

  // 2. Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint failed
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[]) || [];
      const fields = target.length > 0 ? target.join(", ") : "field";
      return sendError(res, 409, `Unique constraint failed on: ${fields}`);
    }
    // P2025: Record not found
    if (err.code === "P2025") {
      return sendError(res, 404, "Record not found");
    }
  }

  // 3. JWT Errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token");
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token expired");
  }

  // 4. Syntax Error (JSON body parsing)
  if (err instanceof SyntaxError && "body" in err) {
    return sendError(res, 400, "Invalid JSON format");
  }

  // 5. Default / Custom Error
  const code = err.statusCode || 500;
  const msg = err.message || "Internal Server Error";

  // Log error (file log for production, console for dev)
  if (code === 500) {
    Log.error(msg, {
      error: err,
      path: req.path,
      method: req.method,
      ip: req.ip,
      stack: err.stack,
    });
  }

  return sendError(res, code, msg);
}
