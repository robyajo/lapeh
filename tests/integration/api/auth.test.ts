import request from "supertest";
import { createApp } from "../../../lib/bootstrap";
import { Express } from "express";
import { prisma } from "@lapeh/core/database";

describe("Auth API Integration", () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      // Mock prisma.users.count for unique check (0 means unique/not found)
      (prisma.users.count as jest.Mock).mockResolvedValue(0);

      // Mock prisma.users.findUnique to return null (user doesn't exist)
      (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock prisma.users.create
      (prisma.users.create as jest.Mock).mockResolvedValue({
        id: 1n,
        uuid: "user-uuid",
        name: userData.name,
        email: userData.email,
        password: "hashedpassword",
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Mock prisma.roles.findUnique for default role
      (prisma.roles.findUnique as jest.Mock).mockResolvedValue({
        id: 1n,
        slug: "user",
        name: "User",
      });

      // Mock prisma.user_roles.create
      (prisma.user_roles.create as jest.Mock).mockResolvedValue({
        id: 1n,
        user_id: 1n,
        role_id: 1n,
      });

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data).toHaveProperty("email", userData.email);
    });

    it("should return 422 if email already exists", async () => {
      (prisma.users.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });

      expect(res.status).toBe(422);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      // We need to match the bcrypt hash.
      const mockUser = {
        id: 1n,
        uuid: "user-uuid",
        name: "Test User",
        email: "test@example.com",
        password: "", // Will be set below
        created_at: new Date(),
        updated_at: new Date(),
      };

      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("password123", 10);
      mockUser.password = hashedPassword;

      (prisma.users.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("token");
    });
  });
});
