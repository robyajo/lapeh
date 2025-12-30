import { Validator } from "../../lib/utils/validator";
import { z } from "zod";

describe("Validator", () => {
  describe("Basic Validation", () => {
    it("should validate simple string rules", async () => {
      const data = { name: "John Doe", email: "john@example.com" };
      const rules = {
        name: "required|string|min:3",
        email: "required|email",
      };

      const validator = Validator.make(data, rules);
      const passes = await validator.passes();

      expect(passes).toBe(true);
      const validated = await validator.validated();
      expect(validated).toEqual(data);
    });

    it("should fail when required field is missing", async () => {
      const data = { name: "John Doe" };
      const rules = {
        name: "required",
        email: "required|email",
      };

      const validator = Validator.make(data, rules);
      const fails = await validator.fails();

      expect(fails).toBe(true);
      const errors = validator.errors();
      expect(errors).toHaveProperty("email");
    });

    it("should validate numeric rules", async () => {
      const data = { age: "25", score: 100 };
      const rules = {
        age: "required|numeric|min:18",
        score: "required|integer|max:100",
      };

      const validator = Validator.make(data, rules);
      expect(await validator.passes()).toBe(true);
    });
  });

  describe("Advanced Rules", () => {
    it("should validate matching fields (same)", async () => {
      const data = { password: "secret", password_confirmation: "secret" };
      const rules = {
        password: "required",
        password_confirmation: "required|same:password",
      };

      const validator = Validator.make(data, rules);
      expect(await validator.passes()).toBe(true);
    });

    it("should fail when fields do not match", async () => {
      const data = { password: "secret", password_confirmation: "wrong" };
      const rules = {
        password: "required",
        password_confirmation: "required|same:password",
      };

      const validator = Validator.make(data, rules);
      expect(await validator.fails()).toBe(true);
      expect(validator.errors()).toHaveProperty("password_confirmation");
    });
  });

  describe("Zod Schema Support", () => {
    it("should accept raw Zod schemas", async () => {
      const data = { username: "roby" };
      const schema = z.object({
        username: z.string().min(3),
      });

      const validator = Validator.make(data, schema);
      expect(await validator.passes()).toBe(true);
    });

    it("should mix string rules and Zod schemas", async () => {
      const data = { username: "roby", age: 25 };
      const rules = {
        username: "required|string",
        age: z.number().min(18),
      };

      const validator = Validator.make(data, rules);
      expect(await validator.passes()).toBe(true);
    });
  });
});
