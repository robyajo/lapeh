import fs from "fs";
import path from "path";

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  uuid: string;
  avatar?: string | null;
  avatar_url?: string | null;
  email_verified_at?: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string | Date;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string | Date;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  created_at: string | Date;
}

// Database file path
const dbPath = path.resolve(process.cwd(), "database.json");

// Load data function
function loadData() {
  if (fs.existsSync(dbPath)) {
    const raw = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(raw);
  }
  return {
    users: [],
    roles: [
      {
        id: "1",
        name: "Admin",
        slug: "admin",
        description: "Administrator",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "2",
        name: "User",
        slug: "user",
        description: "Standard User",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    permissions: [],
    user_roles: [],
    role_permissions: [],
    user_permissions: [],
  };
}

const data = loadData();

// Export mutable arrays
export const users: User[] = data.users;
export const roles: Role[] = data.roles;
export const permissions: Permission[] = data.permissions;
export const user_roles: UserRole[] = data.user_roles;
export const role_permissions: RolePermission[] = data.role_permissions;
export const user_permissions: UserPermission[] = data.user_permissions;

// Helper to save data
export function saveStore() {
  const payload = {
    users,
    roles,
    permissions,
    user_roles,
    role_permissions,
    user_permissions,
  };
  fs.writeFileSync(dbPath, JSON.stringify(payload, null, 2), "utf-8");
}

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);
