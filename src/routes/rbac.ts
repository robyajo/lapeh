import { Router } from "express";
import { requireAdmin } from "../middleware/auth";
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
} from "../controllers/rbacController";

export const rbacRouter = Router();

rbacRouter.post("/roles", requireAdmin, createRole);
rbacRouter.get("/roles", requireAdmin, listRoles);
rbacRouter.put("/roles/:id", requireAdmin, updateRole);
rbacRouter.delete("/roles/:id", requireAdmin, deleteRole);

rbacRouter.post("/permissions", requireAdmin, createPermission);
rbacRouter.get("/permissions", requireAdmin, listPermissions);
rbacRouter.put("/permissions/:id", requireAdmin, updatePermission);
rbacRouter.delete("/permissions/:id", requireAdmin, deletePermission);

rbacRouter.post("/users/assign-role", requireAdmin, assignRoleToUser);
rbacRouter.post("/users/remove-role", requireAdmin, removeRoleFromUser);

rbacRouter.post(
  "/roles/assign-permission",
  requireAdmin,
  assignPermissionToRole
);
rbacRouter.post(
  "/roles/remove-permission",
  requireAdmin,
  removePermissionFromRole
);

rbacRouter.post(
  "/users/assign-permission",
  requireAdmin,
  assignPermissionToUser
);
rbacRouter.post(
  "/users/remove-permission",
  requireAdmin,
  removePermissionFromUser
);
