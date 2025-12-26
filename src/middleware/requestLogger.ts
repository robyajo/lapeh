import { Request, Response, NextFunction } from "express";
import { Log } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const { method, url, ip } = req;

  // Log saat response selesai
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const message = `${method} ${url} ${statusCode} - ${duration}ms - ${ip}`;

    if (statusCode >= 400) {
      Log.warn(message);
    } else {
      Log.info(message);
    }
  });

  next();
};
