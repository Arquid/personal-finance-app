import { describe, it, expect } from "vitest";

const { recurringBillCreateSchema, recurringBillUpdateSchema } = require("./recurringBillSchema");

describe("recurringBillCreateSchema", () => {
  const validData = {
    name: "Netflix",
    merchant: "Netflix",
    amount: 15.99,
    dueDay: 5,
    categoryId: 3,
    isActive: true,
  };

  it("accepts valid recurring bill data", () => {
    expect(recurringBillCreateSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects dueDay below 1", () => {
    expect(recurringBillCreateSchema.safeParse({ ...validData, dueDay: 0 }).success).toBe(false);
  });

  it("rejects dueDay above 31", () => {
    expect(recurringBillCreateSchema.safeParse({ ...validData, dueDay: 32 }).success).toBe(false);
  });

  it("accepts the dueDay boundaries 1 and 31", () => {
    expect(recurringBillCreateSchema.safeParse({ ...validData, dueDay: 1 }).success).toBe(true);
    expect(recurringBillCreateSchema.safeParse({ ...validData, dueDay: 31 }).success).toBe(true);
  });

  it("rejects a zero or negative amount", () => {
    expect(recurringBillCreateSchema.safeParse({ ...validData, amount: 0 }).success).toBe(false);
  });

  it("allows merchant to be omitted", () => {
    const { merchant, ...rest } = validData;
    expect(recurringBillCreateSchema.safeParse(rest).success).toBe(true);
  });
});

describe("recurringBillUpdateSchema", () => {
  it("allows a partial update", () => {
    expect(recurringBillUpdateSchema.safeParse({ amount: 20 }).success).toBe(true);
  });
});
