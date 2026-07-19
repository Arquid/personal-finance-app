import { describe, it, expect } from "vitest";

const { accountCreateSchema, accountUpdateSchema } = require("./accountSchema");

describe("accountCreateSchema", () => {
  it("accepts valid account data", () => {
    const result = accountCreateSchema.safeParse({
      name: "Checking Account",
      type: "checking",
      balance: 100.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = accountCreateSchema.safeParse({ type: "checking" });
    expect(result.success).toBe(false);
  });

  it("rejects a type outside the enum", () => {
    // Regression test: an earlier version of this schema was accidentally a
    // plain object instead of a z.object(...), which crashed the server on
    // startup. This confirms it's a real, working Zod schema.
    const result = accountCreateSchema.safeParse({ name: "Test", type: "bitcoin" });
    expect(result.success).toBe(false);
  });

  it("allows balance to be omitted (defaults handled by the caller)", () => {
    const result = accountCreateSchema.safeParse({ name: "Test", type: "savings" });
    expect(result.success).toBe(true);
  });
});

describe("accountUpdateSchema", () => {
  it("has .partial() applied, so an empty object is valid", () => {
    const result = accountUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
