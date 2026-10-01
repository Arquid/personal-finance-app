import { describe, it, expect } from "vitest";

const { sumDiscretionarySpending } = require("./discretionarySpending");

const tx = (amount, merchant = null, isRecurring = false) => ({ amount, merchant, isRecurring });
const bill = (merchant, isActive = true) => ({ merchant, isActive });

describe("sumDiscretionarySpending", () => {
  it("sums expenses as a positive number", () => {
    expect(sumDiscretionarySpending([tx(-10), tx("-5.50"), tx(-4.5)], [])).toBeCloseTo(20, 5);
  });

  it("ignores income and zero amounts", () => {
    expect(sumDiscretionarySpending([tx(3200), tx(0), tx(-10)], [])).toBe(10);
  });

  it("excludes transactions flagged isRecurring", () => {
    expect(sumDiscretionarySpending([tx(-950, "Landlord", true), tx(-10)], [])).toBe(10);
  });

  it("excludes payments to a recurring bill's merchant even when isRecurring is false", () => {
    // Payments entered through the UI, "Mark as Paid" or a CSV import are never
    // flagged isRecurring, so the merchant is the only signal.
    const bills = [bill("Skyline Properties")];
    expect(sumDiscretionarySpending([tx(-950, "Skyline Properties"), tx(-10, "Corner Shop")], bills)).toBe(10);
  });

  it("matches merchants case-insensitively and ignores surrounding whitespace", () => {
    const bills = [bill("Netflix")];
    expect(sumDiscretionarySpending([tx(-15.99, "  NETFLIX ")], bills)).toBe(0);
  });

  it("also excludes the merchant of an inactive bill, whose old payments won't repeat", () => {
    expect(sumDiscretionarySpending([tx(-15.99, "Netflix")], [bill("Netflix", false)])).toBe(0);
  });

  it("keeps spending at merchants that no bill uses", () => {
    expect(sumDiscretionarySpending([tx(-20, "Bean There Cafe")], [bill("Netflix")])).toBe(20);
  });

  it("copes with bills and transactions that have no merchant", () => {
    expect(sumDiscretionarySpending([tx(-7, null)], [bill(null)])).toBe(7);
  });
});
