import { describe, it, expect } from "vitest";

const { transactionCreateSchema, transactionUpdateSchema } = require("./transactionSchema");

describe("transactionCreateSchema", () => {
  const validData = {
    amount: -12.5,
    description: "Coffee",
    merchant: "Bean There Cafe",
    date: "2026-07-06",
    accountId: 1,
    categoryId: 6,
  };

  it("accepts valid transaction data", () => {
    expect(transactionCreateSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects a zero amount", () => {
    const result = transactionCreateSchema.safeParse({ ...validData, amount: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects an empty description", () => {
    const result = transactionCreateSchema.safeParse({ ...validData, description: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing accountId", () => {
    const { accountId, ...rest } = validData;
    const result = transactionCreateSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid date", () => {
    const result = transactionCreateSchema.safeParse({ ...validData, date: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("allows categoryId to be omitted (uncategorized transaction)", () => {
    const { categoryId, ...rest } = validData;
    expect(transactionCreateSchema.safeParse(rest).success).toBe(true);
  });

  it("allows categoryId to be explicitly null", () => {
    expect(transactionCreateSchema.safeParse({ ...validData, categoryId: null }).success).toBe(
      true,
    );
  });
});

describe("transactionUpdateSchema", () => {
  it("allows a partial update with a single field", () => {
    expect(transactionUpdateSchema.safeParse({ amount: 20 }).success).toBe(true);
  });

  it("still rejects a zero amount when amount is provided", () => {
    expect(transactionUpdateSchema.safeParse({ amount: 0 }).success).toBe(false);
  });
});
