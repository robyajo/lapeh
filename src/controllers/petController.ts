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

  // Gunakan sendFastSuccess untuk performa maksimal
  // Struktur data disesuaikan dengan createPaginatedResponseSchema: { data: [], meta: {} }
  sendFastSuccess(res, 200, petListSerializer, {
    status: "success",
    message: "Pets retrieved successfully",
    data: {
      data: serialized,
      meta,
    },
  });
}

export async function show(req: Request, res: Response) {
  const { id } = req.params;
  const pet = await prisma.pets.findUnique({
    where: { id: BigInt(id) },
  });

  if (!pet) {
    sendError(res, 404, "Pet not found");
    return;
  }

  // Gunakan sendFastSuccess
  sendFastSuccess(res, 200, petSerializer, {
    status: "success",
    message: "Pet retrieved successfully",
    data: {
      ...pet,
      id: pet.id.toString(),
    },
  });
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
    where: { id: BigInt(id) },
  });

  if (!existing) {
    sendError(res, 404, "Pet not found");
    return;
  }

  const validatedData = await validator.validated();
  const updated = await prisma.pets.update({
    where: { id: BigInt(id) },
    data: {
      ...validatedData,
      updated_at: new Date(),
    },
  });

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
    where: { id: BigInt(id) },
  });

  if (!existing) {
    sendError(res, 404, "Pet not found");
    return;
  }

  await prisma.pets.delete({
    where: { id: BigInt(id) },
  });

  sendSuccess(res, 200, "Pet deleted successfully", null);
}
