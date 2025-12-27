import { Router } from "express";
import { requireAdmin, requireAuth } from "@lapeh/middleware/auth";
import {
  createRole,
  listRoles,
  updateRole,
  deleteRole,
  createPermission,
  listPermissions,
  updatePermission,
  deletePermission,
  assignRoleToUser,
  removeRoleFromUser,
  assignPermissionToRole,
  removePermissionFromRole,
  assignPermissionToUser,
  removePermissionFromUser,
} from "@/controllers/rbacController";

export const rbacRouter = Router();

rbacRouter.use(requireAuth);
rbacRouter.use(requireAdmin);

rbacRouter.post("/roles", createRole);
rbacRouter.get("/roles", listRoles);
rbacRouter.put("/roles/:id", updateRole);
rbacRouter.delete("/roles/:id", deleteRole);

rbacRouter.post("/permissions", createPermission);
rbacRouter.get("/permissions", listPermissions);
rbacRouter.put("/permissions/:id", updatePermission);
rbacRouter.delete("/permissions/:id", deletePermission);

rbacRouter.post("/users/assign-role", assignRoleToUser);
rbacRouter.post("/users/remove-role", removeRoleFromUser);

rbacRouter.post("/roles/assign-permission", assignPermissionToRole);
rbacRouter.post("/roles/remove-permission", removePermissionFromRole);

rbacRouter.post("/users/assign-permission", assignPermissionToUser);
rbacRouter.post("/users/remove-permission", removePermissionFromUser);
