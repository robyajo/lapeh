import { Response } from "express";

type SuccessStatus = "success";
type ErrorStatus = "error";

type SuccessBody<T> = {
  status: SuccessStatus;
  message: string;
  data: T;
};

type ErrorBody<T = unknown> = {
  status: ErrorStatus;
  message: string;
  errors?: T;
};

function toJsonSafe(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => toJsonSafe(item));
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = toJsonSafe(val);
    }
    return result;
  }
  return value;
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T
) {
  const body: SuccessBody<T> = { status: "success", message, data };
  return res.status(statusCode).json(toJsonSafe(body));
}

export function sendError<T = unknown>(
  res: Response,
  statusCode: number,
  message: string,
  errors?: T
) {
  const body: ErrorBody<T> = { status: "error", message };
  if (errors !== undefined) {
    body.errors = errors;
  }
  return res.status(statusCode).json(toJsonSafe(body));
}
