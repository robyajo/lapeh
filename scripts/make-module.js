const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Please specify the module name.');
  console.error('   Usage: npm run make:module <name>');
  console.error('   Example: npm run make:module product');
  process.exit(1);
}

// Convert "product" -> "Product" (PascalCase) for Class names
const PascalCaseName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
// Convert "product" -> "product" (camelCase) for variables/files
const camelCaseName = moduleName.toLowerCase();

const srcDir = path.join(__dirname, '..', 'src');

// 1. Create Controller
const controllerContent = `import { Request, Response } from 'express';
import { ${PascalCaseName}Service } from '../services/${camelCaseName}Service';
import { successResponse, errorResponse } from '../utils/response';

export const ${PascalCaseName}Controller = {
  async getAll(req: Request, res: Response) {
    try {
      const data = await ${PascalCaseName}Service.getAll();
      return successResponse(res, data, '${PascalCaseName}s retrieved successfully');
    } catch (error) {
      return errorResponse(res, error as Error);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await ${PascalCaseName}Service.getById(id);
      if (!data) return errorResponse(res, new Error('${PascalCaseName} not found'), 404);
      return successResponse(res, data, '${PascalCaseName} retrieved successfully');
    } catch (error) {
      return errorResponse(res, error as Error);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = await ${PascalCaseName}Service.create(req.body);
      return successResponse(res, data, '${PascalCaseName} created successfully', 201);
    } catch (error) {
      return errorResponse(res, error as Error);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await ${PascalCaseName}Service.update(id, req.body);
      return successResponse(res, data, '${PascalCaseName} updated successfully');
    } catch (error) {
      return errorResponse(res, error as Error);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ${PascalCaseName}Service.delete(id);
      return successResponse(res, null, '${PascalCaseName} deleted successfully');
    } catch (error) {
      return errorResponse(res, error as Error);
    }
  }
};
`;

// 2. Create Service
const serviceContent = `// import prisma from '../prisma'; // Uncomment this line if you use Prisma

export const ${PascalCaseName}Service = {
  async getAll() {
    // return prisma.${camelCaseName}.findMany();
    return [{ id: 1, name: 'Sample ${PascalCaseName}' }]; // Placeholder
  },

  async getById(id: string) {
    // return prisma.${camelCaseName}.findUnique({ where: { id } });
    return { id, name: 'Sample ${PascalCaseName}' }; // Placeholder
  },

  async create(data: any) {
    // return prisma.${camelCaseName}.create({ data });
    return { id: Date.now(), ...data }; // Placeholder
  },

  async update(id: string, data: any) {
    // return prisma.${camelCaseName}.update({ where: { id }, data });
    return { id, ...data }; // Placeholder
  },

  async delete(id: string) {
    // return prisma.${camelCaseName}.delete({ where: { id } });
    return true; // Placeholder
  }
};
`;

// 3. Create Route
const routeContent = `import { Router } from 'express';
import { ${PascalCaseName}Controller } from '../controllers/${camelCaseName}Controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, ${PascalCaseName}Controller.getAll);
router.get('/:id', authenticateToken, ${PascalCaseName}Controller.getById);
router.post('/', authenticateToken, ${PascalCaseName}Controller.create);
router.put('/:id', authenticateToken, ${PascalCaseName}Controller.update);
router.delete('/:id', authenticateToken, ${PascalCaseName}Controller.delete);

export default router;
`;

const paths = {
  controller: path.join(srcDir, 'controllers', `${camelCaseName}Controller.ts`),
  service: path.join(srcDir, 'services', `${camelCaseName}Service.ts`),
  route: path.join(srcDir, 'routes', `${camelCaseName}.ts`),
};

// Helper to create directory if not exists
function ensureDir(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

try {
  ensureDir(paths.controller);
  fs.writeFileSync(paths.controller, controllerContent);
  console.log(`✅ Created Controller: src/controllers/${camelCaseName}Controller.ts`);

  ensureDir(paths.service);
  fs.writeFileSync(paths.service, serviceContent);
  console.log(`✅ Created Service: src/services/${camelCaseName}Service.ts`);

  ensureDir(paths.route);
  fs.writeFileSync(paths.route, routeContent);
  console.log(`✅ Created Route: src/routes/${camelCaseName}.ts`);

  console.log('\n⚠️  Don\'t forget to register the new route in src/index.ts or src/server.ts!');
  console.log(`   import ${camelCaseName}Routes from './routes/${camelCaseName}';`);
  console.log(`   app.use('/${camelCaseName}s', ${camelCaseName}Routes);`);

} catch (error) {
  console.error('❌ Error creating module:', error);
  process.exit(1);
}
