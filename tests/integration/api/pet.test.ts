import request from "supertest";
import { createApp } from "../../../lib/bootstrap";
import { Express } from "express";
import { prisma } from "@lapeh/core/database";

describe("Pet API Integration", () => {
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
      expect(res.body.data.data[0]).toHaveProperty("name", "Fluffy");
      expect(res.body.data.data[0]).toHaveProperty("id", "1");
    });
  });

  describe("POST /api/pets", () => {
    it("should create a new pet", async () => {
      const petData = {
        name: "Rex",
        species: "Dog",
        age: 2,
      };

      (prisma.pets.create as jest.Mock).mockResolvedValue({
        id: 3n,
        ...petData,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const res = await request(app)
        .post("/api/pets")
        .send(petData);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("name", "Rex");
      expect(res.body.data).toHaveProperty("id", "3");
    });

    it("should return 422 if validation fails", async () => {
      const res = await request(app)
        .post("/api/pets")
        .send({
          name: "Rex",
          // missing species and age
        });

      expect(res.status).toBe(422);
    });
  });

  describe("GET /api/pets/:id", () => {
    it("should return a pet details", async () => {
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
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("name", "Fluffy");
      expect(res.body.data).toHaveProperty("id", "1");
    });

    it("should return 404 if pet not found", async () => {
      (prisma.pets.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/api/pets/999");

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/pets/:id", () => {
    it("should update a pet", async () => {
      const mockPet = {
        id: 1n,
        name: "Fluffy",
        species: "Cat",
        age: 3,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.pets.findUnique as jest.Mock).mockResolvedValue(mockPet);
      (prisma.pets.update as jest.Mock).mockResolvedValue({
        ...mockPet,
        name: "Fluffy Updated",
      });

      const res = await request(app)
        .put("/api/pets/1")
        .send({
          name: "Fluffy Updated",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("name", "Fluffy Updated");
    });

    it("should return 404 if pet to update not found", async () => {
      (prisma.pets.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put("/api/pets/999")
        .send({ name: "New Name" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/pets/:id", () => {
    it("should delete a pet", async () => {
      const mockPet = {
        id: 1n,
        name: "Fluffy",
        species: "Cat",
        age: 3,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.pets.findUnique as jest.Mock).mockResolvedValue(mockPet);
      (prisma.pets.delete as jest.Mock).mockResolvedValue(mockPet);

      const res = await request(app).delete("/api/pets/1");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Pet deleted successfully");
    });

    it("should return 404 if pet to delete not found", async () => {
      (prisma.pets.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete("/api/pets/999");

      expect(res.status).toBe(404);
    });
  });
});
