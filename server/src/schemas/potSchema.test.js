import { describe, it, expect } from "vitest";

const { potCreateSchema, potUpdateSchema, potAmountSchema } = require("./potSchema");

describe("potCreateSchema", () => {
  it("accepts valid pot data", () => {
    const result = potCreateSchema.safeParse({
      name: "Vacation",
      targetAmount: 2000,
      color: "#0984e3",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a zero or negative targetAmount", () => {
    expect(
      potCreateSchema.safeParse({ name: "Vacation", targetAmount: 0, color: "#000" }).success,
    ).toBe(false);
  });

  it("rejects an empty name", () => {
    expect(
      potCreateSchema.safeParse({ name: "", targetAmount: 100, color: "#000" }).success,
    ).toBe(false);
  });
});

describe("potUpdateSchema", () => {
  it("allows a partial update", () => {
    expect(potUpdateSchema.safeParse({ targetAmount: 3000 }).success).toBe(true);
  });
});

describe("potAmountSchema (used for deposit/withdraw)", () => {
  it("accepts a positive amount", () => {
    expect(potAmountSchema.safeParse({ amount: 50 }).success).toBe(true);
  });

  it("rejects a negative amount", () => {
    expect(potAmountSchema.safeParse({ amount: -50 }).success).toBe(false);
  });

  it("rejects a zero amount", () => {
    expect(potAmountSchema.safeParse({ amount: 0 }).success).toBe(false);
  });

  it("rejects a missing amount", () => {
    expect(potAmountSchema.safeParse({}).success).toBe(false);
  });
});
