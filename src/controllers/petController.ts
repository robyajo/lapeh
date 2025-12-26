
import { Request, Response } from "express";
import { prisma } from "../prisma";
import { sendSuccess, sendError } from "../utils/response";
import { createPetSchema, updatePetSchema } from "../schema/pet-schema";
import { getPagination, buildPaginationMeta } from "../utils/pagination";

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
  const parsed = createPetSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    sendError(res, 422, "Validation error", errors);
    return;
  }

  const pet = await prisma.pets.create({
    data: {
      ...parsed.data,
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
  const parsed = updatePetSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    sendError(res, 422, "Validation error", errors);
    return;
  }

  const existing = await prisma.pets.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existing) {
    sendError(res, 404, "Pet not found");
    return;
  }

  const updated = await prisma.pets.update({
    where: { id: BigInt(id) },
    data: {
      ...parsed.data,
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
