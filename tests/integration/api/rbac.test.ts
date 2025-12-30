import request from "supertest";
import { createApp } from "../../../lib/bootstrap";
import { Express } from "express";
import {
  users,
  roles,
  permissions,
  user_roles,
  user_permissions,
  role_permissions,
} from "../../../lib/core/store";

// Mock auth middleware
jest.mock("@lapeh/middleware/auth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    // Simulate admin user
    req.user = { userId: "1", role: "admin" };
    next();
  },
  requireAdmin: (_req: any, _res: any, next: any) => next(),
}));

describe("RBAC API Integration", () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp();
  });

  beforeEach(() => {
    // Reset store state before each test
    users.length = 0;
    roles.length = 0;
    permissions.length = 0;
    user_roles.length = 0;
    user_permissions.length = 0;
    role_permissions.length = 0;

    // Seed initial data
    users.push({
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      password: "hashedpassword",
      uuid: "uuid-1",
      created_at: new Date(),
      updated_at: new Date(),
    });

    roles.push(
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
      }
    );
  });

  describe("Roles", () => {
    it("should list roles", async () => {
      const res = await request(app).get("/api/rbac/roles");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data[0]).toHaveProperty("slug", "admin");
    });

    it("should create a role", async () => {
      const roleData = { name: "Editor", slug: "editor" };

      const res = await request(app).post("/api/rbac/roles").send(roleData);
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("slug", "editor");
      expect(roles.find((r) => r.slug === "editor")).toBeDefined();
    });
  });

  describe("Permissions", () => {
    it("should create a permission", async () => {
      const permData = { name: "Edit Post", slug: "edit-post" };

      const res = await request(app)
        .post("/api/rbac/permissions")
        .send(permData);
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("slug", "edit-post");
      expect(permissions.find((p) => p.slug === "edit-post")).toBeDefined();
    });

    it("should list permissions", async () => {
      // Create one first
      permissions.push({
        id: "100",
        name: "View Dashboard",
        slug: "view-dashboard",
        created_at: new Date(),
        updated_at: new Date(),
      });

      const res = await request(app).get("/api/rbac/permissions");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Assignment", () => {
    it("should assign role to user", async () => {
      const res = await request(app).post("/api/rbac/users/assign-role").send({
        userId: "1",
        roleId: "2",
      });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Role assigned to user");
      expect(
        user_roles.find((ur) => ur.user_id === "1" && ur.role_id === "2")
      ).toBeDefined();
    });

    it("should return 404 if user not found when assigning role", async () => {
      const res = await request(app).post("/api/rbac/users/assign-role").send({
        userId: "999",
        roleId: "2",
      });
      expect(res.status).toBe(404);
    });
  });
});
