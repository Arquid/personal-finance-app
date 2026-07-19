import { describe, it, expect } from "vitest";

const { budgetCreateSchema, budgetUpdateSchema } = require("./budgetSchema");

describe("budgetCreateSchema", () => {
  it("accepts valid budget data", () => {
    const result = budgetCreateSchema.safeParse({
      categoryId: 2,
      limitAmount: 400,
      period: "monthly",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a zero or negative limitAmount", () => {
    expect(
      budgetCreateSchema.safeParse({ categoryId: 2, limitAmount: 0 }).success,
    ).toBe(false);
    expect(
      budgetCreateSchema.safeParse({ categoryId: 2, limitAmount: -50 }).success,
    ).toBe(false);
  });

  it("rejects a missing categoryId", () => {
    expect(budgetCreateSchema.safeParse({ limitAmount: 100 }).success).toBe(false);
  });

  it("rejects a period outside the enum", () => {
    const result = budgetCreateSchema.safeParse({
      categoryId: 2,
      limitAmount: 100,
      period: "daily",
    });
    expect(result.success).toBe(false);
  });

  it("allows period to be omitted", () => {
    const result = budgetCreateSchema.safeParse({ categoryId: 2, limitAmount: 100 });
    expect(result.success).toBe(true);
  });
});

describe("budgetUpdateSchema", () => {
  it("allows updating just the limitAmount", () => {
    expect(budgetUpdateSchema.safeParse({ limitAmount: 250 }).success).toBe(true);
  });
});
