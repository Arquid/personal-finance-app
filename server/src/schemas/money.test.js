import { describe, it, expect } from "vitest";

const { money, isValidMoney, MAX_MONEY } = require("./money");

describe("money", () => {
  it("accepts whole amounts and amounts with up to 2 decimals", () => {
    for (const value of [0, 1, 12.3, 12.34, -320.4, "5.50", 2450.75]) {
      expect(money().safeParse(value).success).toBe(true);
    }
  });

  it("rejects more than 2 decimal places", () => {
    for (const value of [0.005, 5.555, 1e-7]) {
      expect(money().safeParse(value).success).toBe(false);
    }
  });

  it("has no floating-point false rejections for any whole number of cents", () => {
    for (let cents = 1; cents <= 50000; cents++) {
      expect(isValidMoney(cents / 100)).toBe(true);
    }
  });

  it("accepts the largest value that fits Decimal(12,2) and rejects anything above it", () => {
    expect(isValidMoney(MAX_MONEY)).toBe(true);
    expect(isValidMoney(-MAX_MONEY)).toBe(true);
    expect(isValidMoney(MAX_MONEY + 0.01)).toBe(false);
    expect(isValidMoney(1e15)).toBe(false);
    expect(isValidMoney(1e20)).toBe(false);
  });

  it("rejects values that are not numbers", () => {
    expect(isValidMoney("abc")).toBe(false);
    expect(isValidMoney(NaN)).toBe(false);
  });
});
