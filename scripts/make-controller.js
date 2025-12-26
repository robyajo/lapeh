const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const controllerName = args[0];
const isResource = args.includes('-r') || args.includes('--resource');

if (!controllerName || controllerName.startsWith('-')) {
  console.error('❌ Please specify the controller name.');
  console.error('   Usage: npm run make:controller <ControllerName> [-r]');
  console.error('   Example: npm run make:controller TestController -r');
  process.exit(1);
}

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

// Ensure controllers directory exists
if (!fs.existsSync(controllersDir)) {
  fs.mkdirSync(controllersDir, { recursive: true });
}

let fileName = controllerName;
if (!fileName.endsWith('.ts')) {
  fileName += '.ts';
}

// Capitalize first letter if convention is needed, but usually users provide PascalCase
// We will just use what user provided but ensure .ts extension
const filePath = path.join(controllersDir, fileName);

if (fs.existsSync(filePath)) {
  console.error(`❌ Controller ${fileName} already exists at ${filePath}`);
  process.exit(1);
}

let content = '';

if (isResource) {
  content = `import { Request, Response } from "express";
import { prisma } from "../prisma";
import { sendSuccess, sendError } from "../utils/response";
import { getPagination, buildPaginationMeta } from "../utils/pagination";

/**
 * Display a listing of the resource.
 */
export async function index(req: Request, res: Response) {
  const { page, perPage, skip, take } = getPagination(req.query);
  
  // TODO: Add search logic
  const where: any = {};

  // TODO: Replace 'model' with your actual model name
  /*
  const [data, total] = await Promise.all([
    prisma.model.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: "desc" },
    }),
    prisma.model.count({ where }),
  ]);

  const serialized = data.map((item: any) => ({
    ...item,
    id: item.id.toString(),
  }));

  const meta = buildPaginationMeta(page, perPage, total);

  sendSuccess(res, 200, "Data retrieved successfully", {
    data: serialized,
    meta,
  });
  */
  
  sendSuccess(res, 200, "Index method", { message: "Implement me" });
}

/**
 * Display the specified resource.
 */
export async function show(req: Request, res: Response) {
  const { id } = req.params;
  
  // TODO: Replace 'model' with your actual model name
  /*
  const item = await prisma.model.findUnique({
    where: { id: BigInt(id) },
  });

  if (!item) {
    sendError(res, 404, "Data not found");
    return;
  }

  sendSuccess(res, 200, "Data retrieved successfully", {
    ...item,
    id: item.id.toString(),
  });
  */
  sendSuccess(res, 200, "Show method", { id, message: "Implement me" });
}

/**
 * Store a newly created resource in storage.
 */
export async function store(req: Request, res: Response) {
  // TODO: Add validation
  // const parsed = createSchema.safeParse(req.body);
  // if (!parsed.success) { ... }

  // TODO: Replace 'model' with your actual model name
  /*
  const item = await prisma.model.create({
    data: {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  sendSuccess(res, 201, "Data created successfully", {
    ...item,
    id: item.id.toString(),
  });
  */
  sendSuccess(res, 201, "Store method", { message: "Implement me" });
}

/**
 * Update the specified resource in storage.
 */
export async function update(req: Request, res: Response) {
  const { id } = req.params;
  
  // TODO: Add validation
  // const parsed = updateSchema.safeParse(req.body);

  // TODO: Replace 'model' with your actual model name
  /*
  const existing = await prisma.model.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existing) {
    sendError(res, 404, "Data not found");
    return;
  }

  const updated = await prisma.model.update({
    where: { id: BigInt(id) },
    data: {
      ...req.body,
      updated_at: new Date(),
    },
  });

  sendSuccess(res, 200, "Data updated successfully", {
    ...updated,
    id: updated.id.toString(),
  });
  */
  sendSuccess(res, 200, "Update method", { id, message: "Implement me" });
}

/**
 * Remove the specified resource from storage.
 */
export async function destroy(req: Request, res: Response) {
  const { id } = req.params;
  
  // TODO: Replace 'model' with your actual model name
  /*
  const existing = await prisma.model.findUnique({
    where: { id: BigInt(id) },
  });

  if (!existing) {
    sendError(res, 404, "Data not found");
    return;
  }

  await prisma.model.delete({
    where: { id: BigInt(id) },
  });
  */

  sendSuccess(res, 200, "Data deleted successfully", null);
}
`;
} else {
  content = `import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";

export async function index(req: Request, res: Response) {
  sendSuccess(res, 200, "Hello from ${controllerName}", null);
}
`;
}

fs.writeFileSync(filePath, content);

console.log(`✅ Controller created: src/controllers/${fileName}`);
