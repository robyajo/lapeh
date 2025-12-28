import { Request, Response } from "express";
import { prisma } from "@lapeh/core/database";
import { sendError, sendFastSuccess } from "@lapeh/utils/response";
import { Validator } from "@lapeh/utils/validator";
import { z } from "zod";
import { getSerializer, createResponseSchema } from "@lapeh/core/serializer";

// --- Serializers ---

const roleSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string", nullable: true },
    created_at: { type: "string", format: "date-time", nullable: true },
    updated_at: { type: "string", format: "date-time", nullable: true },
  },
};

const permissionSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    slug: { type: "string" },
    description: { type: "string", nullable: true },
    created_at: { type: "string", format: "date-time", nullable: true },
    updated_at: { type: "string", format: "date-time", nullable: true },
  },
};

const roleSerializer = getSerializer("role", createResponseSchema(roleSchema));
const roleListSerializer = getSerializer(
  "role-list",
  createResponseSchema({ type: "array", items: roleSchema })
);

const permissionSerializer = getSerializer(
  "permission",
  createResponseSchema(permissionSchema)
);
const permissionListSerializer = getSerializer(
  "permission-list",
  createResponseSchema({ type: "array", items: permissionSchema })
);

const voidSerializer = getSerializer(
  "void",
  createResponseSchema({ type: "null" })
);

// --- Controllers ---

export async function createRole(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    name: "required|string|min:1",
    slug: "required|string|min:1|unique:roles,slug",
    description: "string",
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }

  const { name, slug, description } = await validator.validated();
  // Manual unique check removed as it is handled by validator

  const role = await prisma.roles.create({
    data: {
      name,
      slug,
      description: description || null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  sendFastSuccess(res, 201, roleSerializer, {
    status: "success",
    message: "Role created",
    data: { ...role, id: role.id.toString() },
  });
}

export async function listRoles(_req: Request, res: Response) {
  const roles = await prisma.roles.findMany({
    orderBy: { id: "asc" },
  });
  const serialized = roles.map((r: any) => ({ ...r, id: r.id.toString() }));
  sendFastSuccess(res, 200, roleListSerializer, {
    status: "success",
    message: "Roles list",
    data: serialized,
  });
}

export async function updateRole(req: Request, res: Response) {
  const { id } = req.params;
  const roleId = BigInt(id);

  const validator = Validator.make(req.body || {}, {
    name: "string",
    slug: `string|unique:roles,slug,${id}`,
    description: "string",
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { name, slug, description } = await validator.validated();

  const role = await prisma.roles.findUnique({ where: { id: roleId } });
  if (!role) {
    sendError(res, 404, "Role not found");
    return;
  }
  // Manual unique check removed as it is handled by validator
  const updated = await prisma.roles.update({
    where: { id: roleId },
    data: {
      name: name ?? role.name,
      slug: slug ?? role.slug,
      description: description ?? role.description,
      updated_at: new Date(),
    },
  });
  sendFastSuccess(res, 200, roleSerializer, {
    status: "success",
    message: "Role updated",
    data: { ...updated, id: updated.id.toString() },
  });
}

export async function deleteRole(req: Request, res: Response) {
  const { id } = req.params;
  const roleId = BigInt(id);
  const role = await prisma.roles.findUnique({ where: { id: roleId } });
  if (!role) {
    sendError(res, 404, "Role not found");
    return;
  }
  await prisma.role_permissions.deleteMany({ where: { role_id: roleId } });
  await prisma.user_roles.deleteMany({ where: { role_id: roleId } });
  await prisma.roles.delete({ where: { id: roleId } });
  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Role deleted",
    data: null,
  });
}

export async function createPermission(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    name: "required|string|min:1",
    slug: "required|string|min:1|unique:permissions,slug",
    description: "string",
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { name, slug, description } = await validator.validated();
  // Manual unique check removed as it is handled by validator

  const permission = await prisma.permissions.create({
    data: {
      name,
      slug,
      description: description || null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  sendFastSuccess(res, 201, permissionSerializer, {
    status: "success",
    message: "Permission created",
    data: { ...permission, id: permission.id.toString() },
  });
}

export async function listPermissions(_req: Request, res: Response) {
  const permissions = await prisma.permissions.findMany({
    orderBy: { id: "asc" },
  });
  const serialized = permissions.map((p: any) => ({
    ...p,
    id: p.id.toString(),
  }));
  sendFastSuccess(res, 200, permissionListSerializer, {
    status: "success",
    message: "Permissions list",
    data: serialized,
  });
}

export async function updatePermission(req: Request, res: Response) {
  const { id } = req.params;
  const permissionId = BigInt(id);

  const validator = Validator.make(req.body || {}, {
    name: "string",
    slug: `string|unique:permissions,slug,${id}`,
    description: "string",
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { name, slug, description } = await validator.validated();

  const permission = await prisma.permissions.findUnique({
    where: { id: permissionId },
  });
  if (!permission) {
    sendError(res, 404, "Permission not found");
    return;
  }
  // Manual unique check removed as it is handled by validator
  const updated = await prisma.permissions.update({
    where: { id: permissionId },
    data: {
      name: name ?? permission.name,
      slug: slug ?? permission.slug,
      description: description ?? permission.description,
      updated_at: new Date(),
    },
  });
  sendFastSuccess(res, 200, permissionSerializer, {
    status: "success",
    message: "Permission updated",
    data: { ...updated, id: updated.id.toString() },
  });
}

export async function deletePermission(req: Request, res: Response) {
  const { id } = req.params;
  const permissionId = BigInt(id);
  const permission = await prisma.permissions.findUnique({
    where: { id: permissionId },
  });
  if (!permission) {
    sendError(res, 404, "Permission not found");
    return;
  }
  await prisma.role_permissions.deleteMany({
    where: { permission_id: permissionId },
  });
  await prisma.user_permissions.deleteMany({
    where: { permission_id: permissionId },
  });
  await prisma.permissions.delete({ where: { id: permissionId } });
  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Permission deleted",
    data: null,
  });
}

export async function assignRoleToUser(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    userId: z.string().min(1, "userId wajib diisi"),
    roleId: z.string().min(1, "roleId wajib diisi"),
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { userId, roleId } = await validator.validated();

  const user = await prisma.users.findUnique({
    where: { id: userId },
  });
  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }
  const role = await prisma.roles.findUnique({
    where: { id: roleId },
  });
  if (!role) {
    sendError(res, 404, "Role not found");
    return;
  }
  await prisma.user_roles.upsert({
    where: {
      user_id_role_id: {
        user_id: userId,
        role_id: roleId,
      },
    },
    create: {
      user_id: userId,
      role_id: roleId,
      created_at: new Date(),
    },
    update: {},
  });
  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Role assigned to user",
    data: null,
  });
}

export async function removeRoleFromUser(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    userId: z.string().min(1, "userId wajib diisi"),
    roleId: z.string().min(1, "roleId wajib diisi"),
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { userId, roleId } = await validator.validated();

  await prisma.user_roles.deleteMany({
    where: {
      user_id: userId,
      role_id: roleId,
    },
  });
  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Role removed from user",
    data: null,
  });
}

export async function assignPermissionToRole(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    roleId: z.string().min(1, "roleId wajib diisi"),
    permissionId: z.string().min(1, "permissionId wajib diisi"),
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { roleId, permissionId } = await validator.validated();

  const role = await prisma.roles.findUnique({
    where: { id: roleId },
  });
  if (!role) {
    sendError(res, 404, "Role not found");
    return;
  }
  const permission = await prisma.permissions.findUnique({
    where: { id: permissionId },
  });
  if (!permission) {
    sendError(res, 404, "Permission not found");
    return;
  }
  await prisma.role_permissions.upsert({
    where: {
      role_id_permission_id: {
        role_id: roleId,
        permission_id: permissionId,
      },
    },
    create: {
      role_id: roleId,
      permission_id: permissionId,
      created_at: new Date(),
    },
    update: {},
  });
  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Permission assigned to role",
    data: null,
  });
}

export async function removePermissionFromRole(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    roleId: z.string().min(1, "roleId wajib diisi"),
    permissionId: z.string().min(1, "permissionId wajib diisi"),
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { roleId, permissionId } = await validator.validated();

  await prisma.role_permissions.deleteMany({
    where: {
      role_id: roleId,
      permission_id: permissionId,
    },
  });
  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Permission removed from role",
    data: null,
  });
}

export async function assignPermissionToUser(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    userId: z.string().min(1, "userId wajib diisi"),
    permissionId: z.string().min(1, "permissionId wajib diisi"),
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { userId, permissionId } = await validator.validated();

  const user = await prisma.users.findUnique({
    where: { id: userId },
  });
  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }
  const permission = await prisma.permissions.findUnique({
    where: { id: permissionId },
  });
  if (!permission) {
    sendError(res, 404, "Permission not found");
    return;
  }
  await prisma.user_permissions.upsert({
    where: {
      user_id_permission_id: {
        user_id: userId,
        permission_id: permissionId,
      },
    },
    create: {
      user_id: userId,
      permission_id: permissionId,
      created_at: new Date(),
    },
    update: {},
  });
  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Permission assigned to user",
    data: null,
  });
}

export async function removePermissionFromUser(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    userId: z.string().min(1, "userId wajib diisi"),
    permissionId: z.string().min(1, "permissionId wajib diisi"),
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { userId, permissionId } = await validator.validated();

  await prisma.user_permissions.deleteMany({
    where: {
      user_id: userId,
      permission_id: permissionId,
    },
  });
  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Permission removed from user",
    data: null,
  });
}
