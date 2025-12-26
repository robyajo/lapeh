
import { z } from "zod";

export const createPetSchema = z.object({
  name: z.string({ message: "Name is required" }),
  species: z.string({ message: "Species is required" }),
  age: z.number({ message: "Age is required" }).int().positive(),
});

export const updatePetSchema = z.object({
  name: z.string().optional(),
  species: z.string().optional(),
  age: z.number().int().positive().optional(),
});
