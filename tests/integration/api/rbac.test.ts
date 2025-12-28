import request from "supertest";
import { createApp } from "../../../lib/bootstrap";
import { Express } from "express";
import { prisma } from "@lapeh/core/database";

// Mock auth middleware
jest.mock("@lapeh/middleware/auth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
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

  describe("Roles", () => {
    it("should list roles", async () => {
      const mockRoles = [
        { id: 1n, name: "Admin", slug: "admin" },
        { id: 2n, name: "User", slug: "user" },
      ];
      (prisma.roles.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const res = await request(app).get("/api/rbac/roles");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0]).toHaveProperty("slug", "admin");
    });

    it("should create a role", async () => {
      const roleData = { name: "Editor", slug: "editor" };
      (prisma.roles.count as jest.Mock).mockResolvedValue(0); // unique check
      (prisma.roles.create as jest.Mock).mockResolvedValue({
        id: 3n,
        ...roleData,
        description: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const res = await request(app).post("/api/rbac/roles").send(roleData);
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("slug", "editor");
    });
  });

  describe("Permissions", () => {
    it("should create a permission", async () => {
      const permData = { name: "Edit Post", slug: "edit-post" };
      (prisma.permissions.count as jest.Mock).mockResolvedValue(0);
      (prisma.permissions.create as jest.Mock).mockResolvedValue({
        id: 1n,
        ...permData,
        description: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const res = await request(app)
        .post("/api/rbac/permissions")
        .send(permData);
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("slug", "edit-post");
    });

    it("should list permissions", async () => {
      const mockPerms = [{ id: 1n, name: "Edit Post", slug: "edit-post" }];
      (prisma.permissions.findMany as jest.Mock).mockResolvedValue(mockPerms);

      const res = await request(app).get("/api/rbac/permissions");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("Assignment", () => {
    it("should assign role to user", async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue({ id: 1n });
      (prisma.roles.findUnique as jest.Mock).mockResolvedValue({ id: 2n });
      (prisma.user_roles.upsert as jest.Mock).mockResolvedValue({});

      const res = await request(app).post("/api/rbac/users/assign-role").send({
        userId: "1",
        roleId: "2",
      });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Role assigned to user");
    });

    it("should return 404 if user not found when assigning role", async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post("/api/rbac/users/assign-role").send({
        userId: "999",
        roleId: "2",
      });
      expect(res.status).toBe(404);
    });
  });
});
