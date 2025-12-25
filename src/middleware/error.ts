import { Request, Response, NextFunction } from "express"
import { sendError } from "../utils/response"
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const code = err.statusCode || 500
  const msg = err.message || "Internal Server Error"
  sendError(res, code, msg)
}

