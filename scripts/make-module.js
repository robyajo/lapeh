const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const moduleName = args[0];

if (!moduleName) {
  console.error('❌ Please specify the module name.');
  console.error('   Usage: npm run make:module <ModuleName>');
  process.exit(1);
}

// Capitalize first letter
const name = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
const lowerName = moduleName.toLowerCase();

const moduleDir = path.join(__dirname, '..', 'src', 'modules', name);

if (fs.existsSync(moduleDir)) {
  console.error(`❌ Module ${name} already exists at ${moduleDir}`);
  process.exit(1);
}

fs.mkdirSync(moduleDir, { recursive: true });

// Controller
const controllerContent = `import { Request, Response } from "express";
import { sendSuccess } from "@lapeh/utils/response";
// import * as ${name}Service from "./${lowerName}.service";

export async function index(_req: Request, res: Response) {
  sendSuccess(res, 200, "Index ${name}");
}

export async function show(req: Request, res: Response) {
  const { id } = req.params;
  sendSuccess(res, 200, "Show ${name} " + id);
}

export async function create(_req: Request, res: Response) {
  sendSuccess(res, 201, "Create ${name}");
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  sendSuccess(res, 200, "Update ${name} " + id);
}

export async function destroy(req: Request, res: Response) {
  const { id } = req.params;
  sendSuccess(res, 200, "Delete ${name} " + id);
}
`;

fs.writeFileSync(path.join(moduleDir, `${lowerName}.controller.ts`), controllerContent);

// Service (Optional but good for NestJS style)
const serviceContent = `// import { prisma } from "@lapeh/core/database";

export async function findAll() {
  return [];
}

export async function findOne(_id: number) {
  return null;
}
`;
fs.writeFileSync(path.join(moduleDir, `${lowerName}.service.ts`), serviceContent);

// Route Stub
const routeContent = `import { Router } from "express";
import * as ${name}Controller from "./${lowerName}.controller";

const router = Router();

router.get("/", ${name}Controller.index);
router.get("/:id", ${name}Controller.show);
router.post("/", ${name}Controller.create);
router.put("/:id", ${name}Controller.update);
router.delete("/:id", ${name}Controller.destroy);

export default router;
`;
fs.writeFileSync(path.join(moduleDir, `${lowerName}.routes.ts`), routeContent);

// Prisma Model
const prismaContent = `model ${name} {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
fs.writeFileSync(path.join(moduleDir, `${lowerName}.prisma`), prismaContent);

console.log(`✅ Module ${name} created successfully at src/modules/${name}`);
console.log(`   - ${lowerName}.controller.ts`);
console.log(`   - ${lowerName}.service.ts`);
console.log(`   - ${lowerName}.routes.ts`);
console.log(`   - ${lowerName}.prisma`);
console.log(`\n👉 Don't forget to register the route in src/routes/index.ts!`);
