import request from "supertest";
import { createApp } from "../../../lib/bootstrap";
import { Express } from "express";
import { users, roles } from "@lapeh/core/store";
import bcrypt from "bcryptjs";

describe("Auth API Integration", () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp();
  });

  beforeEach(() => {
    users.length = 0;
    users.push({
      id: "1",
      name: "Admin User",
      email: "admin@lapeh.com",
      password: bcrypt.hashSync("password", 10),
      uuid: "uuid-admin",
      created_at: new Date(),
      updated_at: new Date(),
    });

    if (roles.length === 0) {
      roles.push(
        {
          id: "1",
          name: "Admin",
          slug: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "2",
          name: "User",
          slug: "user",
          created_at: new Date(),
          updated_at: new Date(),
        }
      );
    }
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data).toHaveProperty("email", userData.email);
    });

    it("should return 422 if email already exists", async () => {
      // Use existing user from store.ts
      const existingUser = {
        name: "Admin User",
        email: "admin@lapeh.com",
        password: "password123",
        confirmPassword: "password123",
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(existingUser);

      expect(res.status).toBe(422);
      expect(res.body.errors).toHaveProperty("email");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      // Use existing user from store.ts (admin@lapeh.com / password)
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@lapeh.com",
        password: "password",
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("token");
    });

    it("should fail with invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin@lapeh.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });
  });
});
