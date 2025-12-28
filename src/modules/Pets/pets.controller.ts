import { Request, Response } from "express";
import { prisma } from "@lapeh/core/database";
import { sendSuccess, sendError, sendFastSuccess } from "@lapeh/utils/response";
import { getPagination, buildPaginationMeta } from "@lapeh/utils/pagination";
import { Validator } from "@lapeh/utils/validator";
import {
  getSerializer,
  createResponseSchema,
  createPaginatedResponseSchema,
} from "@lapeh/core/serializer";
import {
  getCache,
  setCache,
  delCache,
  delCachePattern,
} from "../../../lib/core/redis";

// 1. Definisikan Schema Output untuk performa tinggi
const petSchema = {
  type: "object",
  properties: {
    id: { type: "string" }, // BigInt dikonversi ke string
    name: { type: "string" },
    species: { type: "string" },
    age: { type: "integer" },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
  },
};

// 2. Compile Serializer
// Untuk Single Item
const petSerializer = getSerializer(
  "pet-single",
  createResponseSchema(petSchema)
);

// Untuk List Item (Paginated)
const petListSerializer = getSerializer(
  "pet-list",
  createPaginatedResponseSchema(petSchema)
);

export async function index(req: Request, res: Response) {
  const { page, perPage, skip, take } = getPagination(req.query);
  const search = req.query.search as string;

  // Cache Strategy: Cache list based on query params
  const cacheKey = `pets:list:${JSON.stringify(req.query)}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    sendFastSuccess(res, 200, petListSerializer, cached);
    return;
  }

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { species: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.pets.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: "desc" },
    }),
    prisma.pets.count({ where }),
  ]);

  // Kita perlu convert BigInt ke string sebelum masuk serializer
  // Karena fast-json-stringify mengharapkan tipe data yang sesuai dengan schema
  const serialized = data.map((item: any) => ({
    ...item,
    id: item.id.toString(),
  }));

  const meta = buildPaginationMeta(page, perPage, total);

  const responseData = {
    status: "success",
    message: "Pets retrieved successfully",
    data: {
      data: serialized,
      meta,
    },
  };

  // Cache for 60 seconds
  await setCache(cacheKey, responseData, 60);

  // Gunakan sendFastSuccess untuk performa maksimal
  // Struktur data disesuaikan dengan createPaginatedResponseSchema: { data: [], meta: {} }
  sendFastSuccess(res, 200, petListSerializer, responseData);
}

export async function show(req: Request, res: Response) {
  const { id } = req.params;
  const cacheKey = `pets:${id}`;

  const cached = await getCache(cacheKey);
  if (cached) {
    sendFastSuccess(res, 200, petSerializer, cached);
    return;
  }

  const pet = await prisma.pets.findUnique({
    where: { id: id },
  });

  if (!pet) {
    sendError(res, 404, "Pet not found");
    return;
  }

  const responseData = {
    status: "success",
    message: "Pet retrieved successfully",
    data: {
      ...pet,
      id: pet.id.toString(),
    },
  };

  // Cache for 5 minutes
  await setCache(cacheKey, responseData, 300);

  // Gunakan sendFastSuccess
  sendFastSuccess(res, 200, petSerializer, responseData);
}

export async function store(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    name: "required|string",
    species: "required|string",
    age: "required|integer|min:1",
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }

  const validatedData = await validator.validated();
  const pet = await prisma.pets.create({
    data: {
      ...validatedData,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  // Invalidate list cache
  await delCachePattern("pets:list:*");

  // Gunakan sendFastSuccess
  sendFastSuccess(res, 201, petSerializer, {
    status: "success",
    message: "Pet created successfully",
    data: {
      ...pet,
      id: pet.id.toString(),
    },
  });
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const validator = Validator.make(req.body || {}, {
    name: "string",
    species: "string",
    age: "integer|min:1",
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }

  const existing = await prisma.pets.findUnique({
    where: { id: id },
  });

  if (!existing) {
    sendError(res, 404, "Pet not found");
    return;
  }

  const validatedData = await validator.validated();
  const updated = await prisma.pets.update({
    where: { id: id },
    data: {
      ...validatedData,
      updated_at: new Date(),
    },
  });

  // Invalidate specific cache and list cache
  await delCache(`pets:${id}`);
  await delCachePattern("pets:list:*");

  // Gunakan sendFastSuccess
  sendFastSuccess(res, 200, petSerializer, {
    status: "success",
    message: "Pet updated successfully",
    data: {
      ...updated,
      id: updated.id.toString(),
    },
  });
}

export async function destroy(req: Request, res: Response) {
  const { id } = req.params;

  const existing = await prisma.pets.findUnique({
    where: { id: id },
  });

  if (!existing) {
    sendError(res, 404, "Pet not found");
    return;
  }

  await prisma.pets.delete({
    where: { id: id },
  });

  // Invalidate specific cache and list cache
  await delCache(`pets:${id}`);
  await delCachePattern("pets:list:*");

  sendSuccess(res, 200, "Pet deleted successfully", null);
}
