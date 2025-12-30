import { Validator } from "../../../lib/utils/validator";

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
});
