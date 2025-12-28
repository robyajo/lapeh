import request from "supertest";
import { createApp } from "../../../lib/bootstrap";
import { Express } from "express";
import { prisma } from "@lapeh/core/database";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Mock auth middleware to bypass authentication for protected routes
jest.mock("@lapeh/middleware/auth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    // Simulate authenticated user
    req.user = { userId: "1", role: "user" };
    next();
  },
  requireAdmin: (_req: any, _res: any, next: any) => next(),
}));

describe("Auth Profile API Integration", () => {
  let app: Express;
  const JWT_SECRET = process.env.JWT_SECRET || "test-secret";

  beforeAll(async () => {
    app = await createApp();
  });

  describe("GET /api/auth/me", () => {
    it("should return user profile", async () => {
      const mockUser = {
        id: 1n,
        name: "Test User",
        email: "test@example.com",
        created_at: new Date(),
        updated_at: new Date(),
        user_roles: [{ role: { slug: "user" } }],
      };
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Test User");
      expect(res.body.data.role).toBe("user");
    });

    it("should return 404 if user not found", async () => {
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/auth/profile", () => {
    it("should update user profile", async () => {
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      (prisma.users.count as jest.Mock).mockResolvedValue(0); // Unique email check
      (prisma.users.update as jest.Mock).mockResolvedValue({
        id: 1n,
        ...updateData,
        updated_at: new Date(),
      });

      const res = await request(app).put("/api/auth/profile").send(updateData);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Updated Name");
    });
  });

  describe("PUT /api/auth/password", () => {
    it("should update password", async () => {
      const passwordData = {
        currentPassword: "oldpassword",
        newPassword: "newpassword",
        confirmPassword: "newpassword",
      };

      const hashedPassword = await bcrypt.hash("oldpassword", 10);
      const mockUser = {
        id: 1n,
        password: hashedPassword,
      };

      (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.users.update as jest.Mock).mockResolvedValue({ id: 1n });

      const res = await request(app)
        .put("/api/auth/password")
        .send(passwordData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password updated successfully");
    });

    it("should fail with incorrect current password", async () => {
      const passwordData = {
        currentPassword: "wrongpassword",
        newPassword: "newpassword",
        confirmPassword: "newpassword",
      };

      const hashedPassword = await bcrypt.hash("oldpassword", 10);
      const mockUser = {
        id: 1n,
        password: hashedPassword,
      };

      (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .put("/api/auth/password")
        .send(passwordData);

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh token", async () => {
      const refreshToken = jwt.sign(
        { userId: "1", role: "user", tokenType: "refresh" },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      const mockUser = {
        id: 1n,
        name: "Test User",
        user_roles: [{ role: { slug: "user" } }],
      };
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("token");
    });

    it("should fail with invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/avatar", () => {
    it("should update avatar", async () => {
      // Mock prisma update
      (prisma.users.update as jest.Mock).mockResolvedValue({
        id: 1n,
        avatar: "test.png",
        avatar_url: "/uploads/avatars/test.png",
        user_roles: [{ role: { slug: "user" } }],
      });

      const buffer = Buffer.from("fake image content");
      const res = await request(app)
        .post("/api/auth/avatar")
        .attach("avatar", buffer, "test.png");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });
  });
});
