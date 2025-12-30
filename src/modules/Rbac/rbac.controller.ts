import { Request, Response } from "express";
import {
  users,
  roles,
  permissions,
  role_permissions,
  user_roles,
  user_permissions,
  generateId,
  Role,
  Permission,
  saveStore,
} from "@lapeh/core/store";
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

  // Manual unique check
  if (roles.find((r) => r.slug === slug)) {
    sendError(res, 422, "Validation error", { slug: "Slug already exists" });
    return;
  }

  const role: Role = {
    id: generateId(),
    name,
    slug,
    description: description || null,
    created_at: new Date(),
    updated_at: new Date(),
  };
  roles.push(role);
  saveStore();

  sendFastSuccess(res, 201, roleSerializer, {
    status: "success",
    message: "Role created",
    data: { ...role, id: role.id.toString() },
  });
}

export async function listRoles(_req: Request, res: Response) {
  const serialized = roles.map((r: any) => ({ ...r, id: r.id.toString() }));
  sendFastSuccess(res, 200, roleListSerializer, {
    status: "success",
    message: "Roles list",
    data: serialized,
  });
}

export async function updateRole(req: Request, res: Response) {
  const { id } = req.params;
  const roleId = id;

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

  const roleIndex = roles.findIndex((r) => r.id === roleId);
  if (roleIndex === -1) {
    sendError(res, 404, "Role not found");
    return;
  }

  // Manual unique check for update
  if (
    slug &&
    slug !== roles[roleIndex].slug &&
    roles.find((r) => r.slug === slug)
  ) {
    sendError(res, 422, "Validation error", { slug: "Slug already exists" });
    return;
  }

  roles[roleIndex] = {
    ...roles[roleIndex],
    name: name ?? roles[roleIndex].name,
    slug: slug ?? roles[roleIndex].slug,
    description: description ?? roles[roleIndex].description,
    updated_at: new Date(),
  };
  saveStore();

  const updated = roles[roleIndex];
  sendFastSuccess(res, 200, roleSerializer, {
    status: "success",
    message: "Role updated",
    data: { ...updated, id: updated.id.toString() },
  });
}

export async function deleteRole(req: Request, res: Response) {
  const { id } = req.params;
  const roleId = id;
  const roleIndex = roles.findIndex((r) => r.id === roleId);
  if (roleIndex === -1) {
    sendError(res, 404, "Role not found");
    return;
  }

  // Clean up relationships
  // Remove from role_permissions
  for (let i = role_permissions.length - 1; i >= 0; i--) {
    if (role_permissions[i].role_id === roleId) {
      role_permissions.splice(i, 1);
    }
  }

  // Remove from user_roles
  for (let i = user_roles.length - 1; i >= 0; i--) {
    if (user_roles[i].role_id === roleId) {
      user_roles.splice(i, 1);
    }
  }

  roles.splice(roleIndex, 1);

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

  // Manual unique check
  if (permissions.find((p) => p.slug === slug)) {
    sendError(res, 422, "Validation error", { slug: "Slug already exists" });
    return;
  }

  const permission: Permission = {
    id: generateId(),
    name,
    slug,
    description: description || null,
    created_at: new Date(),
    updated_at: new Date(),
  };
  permissions.push(permission);
  saveStore();

  sendFastSuccess(res, 201, permissionSerializer, {
    status: "success",
    message: "Permission created",
    data: { ...permission, id: permission.id.toString() },
  });
}

export async function listPermissions(_req: Request, res: Response) {
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
  const permissionId = id;

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

  const permIndex = permissions.findIndex((p) => p.id === permissionId);
  if (permIndex === -1) {
    sendError(res, 404, "Permission not found");
    return;
  }

  if (
    slug &&
    slug !== permissions[permIndex].slug &&
    permissions.find((p) => p.slug === slug)
  ) {
    sendError(res, 422, "Validation error", { slug: "Slug already exists" });
    return;
  }

  permissions[permIndex] = {
    ...permissions[permIndex],
    name: name ?? permissions[permIndex].name,
    slug: slug ?? permissions[permIndex].slug,
    description: description ?? permissions[permIndex].description,
    updated_at: new Date(),
  };
  saveStore();

  const updated = permissions[permIndex];

  sendFastSuccess(res, 200, permissionSerializer, {
    status: "success",
    message: "Permission updated",
    data: { ...updated, id: updated.id.toString() },
  });
}

export async function deletePermission(req: Request, res: Response) {
  const { id } = req.params;
  const permissionId = id;

  const permIndex = permissions.findIndex((p) => p.id === permissionId);
  if (permIndex === -1) {
    sendError(res, 404, "Permission not found");
    return;
  }

  // Clean up relationships
  for (let i = role_permissions.length - 1; i >= 0; i--) {
    if (role_permissions[i].permission_id === permissionId) {
      role_permissions.splice(i, 1);
    }
  }

  for (let i = user_permissions.length - 1; i >= 0; i--) {
    if (user_permissions[i].permission_id === permissionId) {
      user_permissions.splice(i, 1);
    }
  }

  permissions.splice(permIndex, 1);
  saveStore();

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

  const user = users.find((u) => u.id === userId);
  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }
  const role = roles.find((r) => r.id === roleId);
  if (!role) {
    sendError(res, 404, "Role not found");
    return;
  }

  const exists = user_roles.find(
    (ur) => ur.user_id === userId && ur.role_id === roleId
  );
  if (!exists) {
    user_roles.push({
      id: generateId(),
      user_id: userId,
      role_id: roleId,
      created_at: new Date(),
    });
    saveStore();
  }

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

  for (let i = user_roles.length - 1; i >= 0; i--) {
    if (user_roles[i].user_id === userId && user_roles[i].role_id === roleId) {
      user_roles.splice(i, 1);
    }
  }

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

  const role = roles.find((r) => r.id === roleId);
  if (!role) {
    sendError(res, 404, "Role not found");
    return;
  }
  const permission = permissions.find((p) => p.id === permissionId);
  if (!permission) {
    sendError(res, 404, "Permission not found");
    return;
  }

  const exists = role_permissions.find(
    (rp) => rp.role_id === roleId && rp.permission_id === permissionId
  );
  if (!exists) {
    role_permissions.push({
      id: generateId(),
      role_id: roleId,
      permission_id: permissionId,
      created_at: new Date(),
    });
    saveStore();
  }

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

  for (let i = role_permissions.length - 1; i >= 0; i--) {
    if (
      role_permissions[i].role_id === roleId &&
      role_permissions[i].permission_id === permissionId
    ) {
      role_permissions.splice(i, 1);
    }
  }

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

  const user = users.find((u) => u.id === userId);
  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }
  const permission = permissions.find((p) => p.id === permissionId);
  if (!permission) {
    sendError(res, 404, "Permission not found");
    return;
  }

  const exists = user_permissions.find(
    (up) => up.user_id === userId && up.permission_id === permissionId
  );
  if (!exists) {
    user_permissions.push({
      id: generateId(),
      user_id: userId,
      permission_id: permissionId,
      created_at: new Date(),
    });
  }

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

  const index = user_permissions.findIndex(
    (up) => up.user_id === userId && up.permission_id === permissionId
  );
  if (index !== -1) {
    user_permissions.splice(index, 1);
    saveStore();
  }

  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Permission removed from user",
    data: null,
  });
}
