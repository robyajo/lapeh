import { Request, Response } from "express";
import { prisma } from "../prisma";
import { sendSuccess, sendError } from "../utils/response";

export async function createRole(req: Request, res: Response) {
  const { name, slug, description } = req.body || {};
  if (!name || !slug) {
    sendError(res, 422, "Validation error", {
      name: !name ? ["Nama role wajib diisi"] : undefined,
      slug: !slug ? ["Slug role wajib diisi"] : undefined,
    });
    return;
  }
  const exists = await prisma.roles.findUnique({ where: { slug } });
  if (exists) {
    sendError(res, 409, "Role already exists", {
      slug: ["Slug role sudah digunakan"],
    });
    return;
  }
  const role = await prisma.roles.create({
    data: {
      name,
      slug,
      description: description || null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  sendSuccess(res, 201, "Role created", role);
}

export async function listRoles(_req: Request, res: Response) {
  const roles = await prisma.roles.findMany({
    orderBy: { id: "asc" },
  });
  sendSuccess(res, 200, "Roles list", roles);
}

export async function updateRole(req: Request, res: Response) {
  const { id } = req.params;
  const roleId = BigInt(id);
  const { name, slug, description } = req.body || {};
  const role = await prisma.roles.findUnique({ where: { id: roleId } });
  if (!role) {
    sendError(res, 404, "Role not found");
    return;
  }
  if (slug) {
    const exists = await prisma.roles.findFirst({
      where: {
        slug,
        NOT: { id: roleId },
      },
    });
    if (exists) {
      sendError(res, 409, "Role already exists", {
        slug: ["Slug role sudah digunakan"],
      });
      return;
    }
  }
  const updated = await prisma.roles.update({
    where: { id: roleId },
    data: {
      name: name ?? role.name,
      slug: slug ?? role.slug,
      description: description ?? role.description,
      updated_at: new Date(),
    },
  });
  sendSuccess(res, 200, "Role updated", updated);
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
  sendSuccess(res, 200, "Role deleted", null);
}

export async function createPermission(req: Request, res: Response) {
  const { name, slug, description } = req.body || {};
  if (!name || !slug) {
    sendError(res, 422, "Validation error", {
      name: !name ? ["Nama permission wajib diisi"] : undefined,
      slug: !slug ? ["Slug permission wajib diisi"] : undefined,
    });
    return;
  }
  const exists = await prisma.permissions.findUnique({ where: { slug } });
  if (exists) {
    sendError(res, 409, "Permission already exists", {
      slug: ["Slug permission sudah digunakan"],
    });
    return;
  }
  const permission = await prisma.permissions.create({
    data: {
      name,
      slug,
      description: description || null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  sendSuccess(res, 201, "Permission created", permission);
}

export async function listPermissions(_req: Request, res: Response) {
  const permissions = await prisma.permissions.findMany({
    orderBy: { id: "asc" },
  });
  sendSuccess(res, 200, "Permissions list", permissions);
}

export async function updatePermission(req: Request, res: Response) {
  const { id } = req.params;
  const permissionId = BigInt(id);
  const { name, slug, description } = req.body || {};
  const permission = await prisma.permissions.findUnique({
    where: { id: permissionId },
  });
  if (!permission) {
    sendError(res, 404, "Permission not found");
    return;
  }
  if (slug) {
    const exists = await prisma.permissions.findFirst({
      where: {
        slug,
        NOT: { id: permissionId },
      },
    });
    if (exists) {
      sendError(res, 409, "Permission already exists", {
        slug: ["Slug permission sudah digunakan"],
      });
      return;
    }
  }
  const updated = await prisma.permissions.update({
    where: { id: permissionId },
    data: {
      name: name ?? permission.name,
      slug: slug ?? permission.slug,
      description: description ?? permission.description,
      updated_at: new Date(),
    },
  });
  sendSuccess(res, 200, "Permission updated", updated);
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
  sendSuccess(res, 200, "Permission deleted", null);
}

export async function assignRoleToUser(req: Request, res: Response) {
  const { userId, roleId } = req.body || {};
  if (!userId || !roleId) {
    sendError(res, 422, "Validation error", {
      userId: !userId ? ["userId wajib diisi"] : undefined,
      roleId: !roleId ? ["roleId wajib diisi"] : undefined,
    });
    return;
  }
  const user = await prisma.users.findUnique({
    where: { id: BigInt(userId) },
  });
  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }
  const role = await prisma.roles.findUnique({
    where: { id: BigInt(roleId) },
  });
  if (!role) {
    sendError(res, 404, "Role not found");
    return;
  }
  await prisma.user_roles.upsert({
    where: {
      user_id_role_id: {
        user_id: BigInt(userId),
        role_id: BigInt(roleId),
      },
    },
    create: {
      user_id: BigInt(userId),
      role_id: BigInt(roleId),
      created_at: new Date(),
    },
    update: {},
  });
  sendSuccess(res, 200, "Role assigned to user", null);
}

export async function removeRoleFromUser(req: Request, res: Response) {
  const { userId, roleId } = req.body || {};
  if (!userId || !roleId) {
    sendError(res, 422, "Validation error", {
      userId: !userId ? ["userId wajib diisi"] : undefined,
      roleId: !roleId ? ["roleId wajib diisi"] : undefined,
    });
    return;
  }
  await prisma.user_roles.deleteMany({
    where: {
      user_id: BigInt(userId),
      role_id: BigInt(roleId),
    },
  });
  sendSuccess(res, 200, "Role removed from user", null);
}

export async function assignPermissionToRole(req: Request, res: Response) {
  const { roleId, permissionId } = req.body || {};
  if (!roleId || !permissionId) {
    sendError(res, 422, "Validation error", {
      roleId: !roleId ? ["roleId wajib diisi"] : undefined,
      permissionId: !permissionId ? ["permissionId wajib diisi"] : undefined,
    });
    return;
  }
  const role = await prisma.roles.findUnique({
    where: { id: BigInt(roleId) },
  });
  if (!role) {
    sendError(res, 404, "Role not found");
    return;
  }
  const permission = await prisma.permissions.findUnique({
    where: { id: BigInt(permissionId) },
  });
  if (!permission) {
    sendError(res, 404, "Permission not found");
    return;
  }
  await prisma.role_permissions.upsert({
    where: {
      role_id_permission_id: {
        role_id: BigInt(roleId),
        permission_id: BigInt(permissionId),
      },
    },
    create: {
      role_id: BigInt(roleId),
      permission_id: BigInt(permissionId),
      created_at: new Date(),
    },
    update: {},
  });
  sendSuccess(res, 200, "Permission assigned to role", null);
}

export async function removePermissionFromRole(req: Request, res: Response) {
  const { roleId, permissionId } = req.body || {};
  if (!roleId || !permissionId) {
    sendError(res, 422, "Validation error", {
      roleId: !roleId ? ["roleId wajib diisi"] : undefined,
      permissionId: !permissionId ? ["permissionId wajib diisi"] : undefined,
    });
    return;
  }
  await prisma.role_permissions.deleteMany({
    where: {
      role_id: BigInt(roleId),
      permission_id: BigInt(permissionId),
    },
  });
  sendSuccess(res, 200, "Permission removed from role", null);
}

export async function assignPermissionToUser(req: Request, res: Response) {
  const { userId, permissionId } = req.body || {};
  if (!userId || !permissionId) {
    sendError(res, 422, "Validation error", {
      userId: !userId ? ["userId wajib diisi"] : undefined,
      permissionId: !permissionId ? ["permissionId wajib diisi"] : undefined,
    });
    return;
  }
  const user = await prisma.users.findUnique({
    where: { id: BigInt(userId) },
  });
  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }
  const permission = await prisma.permissions.findUnique({
    where: { id: BigInt(permissionId) },
  });
  if (!permission) {
    sendError(res, 404, "Permission not found");
    return;
  }
  await prisma.user_permissions.upsert({
    where: {
      user_id_permission_id: {
        user_id: BigInt(userId),
        permission_id: BigInt(permissionId),
      },
    },
    create: {
      user_id: BigInt(userId),
      permission_id: BigInt(permissionId),
      created_at: new Date(),
    },
    update: {},
  });
  sendSuccess(res, 200, "Permission assigned to user", null);
}

export async function removePermissionFromUser(req: Request, res: Response) {
  const { userId, permissionId } = req.body || {};
  if (!userId || !permissionId) {
    sendError(res, 422, "Validation error", {
      userId: !userId ? ["userId wajib diisi"] : undefined,
      permissionId: !permissionId ? ["permissionId wajib diisi"] : undefined,
    });
    return;
  }
  await prisma.user_permissions.deleteMany({
    where: {
      user_id: BigInt(userId),
      permission_id: BigInt(permissionId),
    },
  });
  sendSuccess(res, 200, "Permission removed from user", null);
}
