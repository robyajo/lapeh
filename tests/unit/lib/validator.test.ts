import { Validator } from "../../../lib/utils/validator";
import { prisma } from "@lapeh/core/database";

describe("Validator", () => {
  it("should validate required fields", async () => {
    const data = {};
    const rules = { name: "required" };
    const validator = Validator.make(data, rules);

    expect(await validator.fails()).toBe(true);
    expect(validator.errors()).toHaveProperty("name");
  });

  it("should validate email format", async () => {
    const data = { email: "invalid-email" };
    const rules = { email: "email" };
    const validator = Validator.make(data, rules);

    expect(await validator.fails()).toBe(true);
    expect(validator.errors()).toHaveProperty("email");
  });

  it("should validate unique field using prisma", async () => {
    const data = { email: "test@example.com" };
    const rules = { email: "unique:users,email" };

    (prisma.users.count as jest.Mock).mockResolvedValue(1); // Exists

    const validator = Validator.make(data, rules);

    expect(await validator.fails()).toBe(true);
    expect(validator.errors()).toHaveProperty("email");
    expect(prisma.users.count).toHaveBeenCalled();
  });

  it("should pass unique field if not found", async () => {
    const data = { email: "new@example.com" };
    const rules = { email: "unique:users,email" };

    (prisma.users.count as jest.Mock).mockResolvedValue(0); // Does not exist

    const validator = Validator.make(data, rules);

    expect(await validator.fails()).toBe(false);
  });
});
