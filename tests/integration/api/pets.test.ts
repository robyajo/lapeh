import request from "supertest";
import { createApp } from "../../../lib/bootstrap";
import { Express } from "express";
import { prisma } from "@lapeh/core/database";

// No need to mock auth since pets routes are public
// But we might need to mock @lapeh/middleware/multipart if it causes issues
// For now, let's assume it handles JSON gracefully

describe("Pets API Integration", () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp();
  });

  describe("GET /api/pets", () => {
    it("should return a list of pets", async () => {
      const mockPets = [
        {
          id: 1n,
          name: "Fluffy",
          species: "Cat",
          age: 3,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2n,
          name: "Buddy",
          species: "Dog",
          age: 5,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (prisma.pets.findMany as jest.Mock).mockResolvedValue(mockPets);
      (prisma.pets.count as jest.Mock).mockResolvedValue(2);

      const res = await request(app).get("/api/pets");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.data).toHaveLength(2);
      expect(res.body.data.data[0].name).toBe("Fluffy");
      expect(res.body.data.meta.total).toBe(2);
    });

    it("should filter pets by search query", async () => {
      (prisma.pets.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pets.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get("/api/pets?search=Fluffy");
      expect(res.status).toBe(200);
      // Check if findMany was called with where clause containing search
      expect(prisma.pets.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: "Fluffy", mode: "insensitive" } },
            ]),
          }),
        })
      );
    });
  });

  describe("GET /api/pets/:id", () => {
    it("should return a single pet", async () => {
      const mockPet = {
        id: 1n,
        name: "Fluffy",
        species: "Cat",
        age: 3,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prisma.pets.findUnique as jest.Mock).mockResolvedValue(mockPet);

      const res = await request(app).get("/api/pets/1");
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Fluffy");
    });

    it("should return 404 if pet not found", async () => {
      (prisma.pets.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/api/pets/999");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/pets", () => {
    it("should create a new pet", async () => {
      const newPet = {
        name: "Goldie",
        species: "Fish",
        age: 1,
      };

      (prisma.pets.create as jest.Mock).mockResolvedValue({
        id: 3n,
        ...newPet,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const res = await request(app).post("/api/pets").send(newPet);
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("Goldie");
    });

    it("should return 422 for validation error", async () => {
      const invalidPet = {
        name: "Invalid",
        // missing species
        age: "not a number",
      };

      const res = await request(app).post("/api/pets").send(invalidPet);
      expect(res.status).toBe(422);
      expect(res.body.errors).toHaveProperty("species");
      expect(res.body.errors).toHaveProperty("age");
    });
  });

  describe("PUT /api/pets/:id", () => {
    it("should update an existing pet", async () => {
      const updateData = { age: 4 };
      const existingPet = {
        id: 1n,
        name: "Fluffy",
        species: "Cat",
        age: 3,
      };

      (prisma.pets.findUnique as jest.Mock).mockResolvedValue(existingPet);
      (prisma.pets.update as jest.Mock).mockResolvedValue({
        ...existingPet,
        age: 4,
        updated_at: new Date(),
      });

      const res = await request(app).put("/api/pets/1").send(updateData);
      expect(res.status).toBe(200);
      expect(res.body.data.age).toBe(4);
    });

    it("should return 404 if updating non-existent pet", async () => {
      (prisma.pets.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put("/api/pets/999").send({ age: 4 });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/pets/:id", () => {
    it("should delete a pet", async () => {
      (prisma.pets.findUnique as jest.Mock).mockResolvedValue({ id: 1n });
      (prisma.pets.delete as jest.Mock).mockResolvedValue({ id: 1n });

      const res = await request(app).delete("/api/pets/1");
      expect(res.status).toBe(200);
    });

    it("should return 404 if deleting non-existent pet", async () => {
      (prisma.pets.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete("/api/pets/999");
      expect(res.status).toBe(404);
    });
  });
});
