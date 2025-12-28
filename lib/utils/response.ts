import { Response } from "express";
import { Log } from "./logger";

type SuccessStatus = "success";
type ErrorStatus = "error";

type SuccessBody<T> = {
  status: SuccessStatus;
  message: string;
  data?: T;
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

export function sendSuccess<T = any>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
) {
  const body: SuccessBody<T | undefined> = { status: "success", message, data };
  return res.status(statusCode).json(toJsonSafe(body));
}

/**
 * Mengirim response sukses dengan performa tinggi menggunakan Schema Serialization (Fastify-style).
 * Melewati proses JSON.stringify standar yang lambat.
 *
 * @param serializer Fungsi serializer yang sudah dicompile dari src/core/serializer
 */
export function sendFastSuccess(
  res: Response,
  statusCode: number,
  serializer: (doc: any) => string,
  data: any
) {
  // Set header manual karena kita mengirim raw string
  res.setHeader("Content-Type", "application/json");
  res.status(statusCode);

  // Serializer mengembalikan string JSON
  const jsonString = serializer(data);
  return res.send(jsonString);
}

export function sendError<T = unknown>(
  res: Response,
  statusCode: number,
  message: string,
  errors?: T
) {
  // Log the error
  if (statusCode >= 500) {
    Log.error(message, { statusCode, errors });
  } else if (statusCode >= 400) {
    Log.warn(message, { statusCode, errors });
  }

  const body: ErrorBody<T> = { status: "error", message };
  if (errors !== undefined) {
    body.errors = errors;
  }
  return res.status(statusCode).json(toJsonSafe(body));
}
