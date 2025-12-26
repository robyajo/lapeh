import { Request, Response } from "express";
import { prisma } from "../core/database";
import { sendSuccess, sendError } from "../utils/response";
import { getPagination, buildPaginationMeta } from "../utils/pagination";
import { Validator } from "../utils/validator";

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

  const serialized = data.map((item: any) => ({
    ...item,
    id: item.id.toString(),
  }));

  const meta = buildPaginationMeta(page, perPage, total);

  sendSuccess(res, 200, "Pets retrieved successfully", {
    data: serialized,
    meta,
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

  sendSuccess(res, 200, "Pet retrieved successfully", {
    ...pet,
    id: pet.id.toString(),
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

  sendSuccess(res, 201, "Pet created successfully", {
    ...pet,
    id: pet.id.toString(),
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

  sendSuccess(res, 200, "Pet updated successfully", {
    ...updated,
    id: updated.id.toString(),
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
