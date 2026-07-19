import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { computeBillStatus, getCurrentMonthRange } = require("./recurringBillStatus");

describe("computeBillStatus", () => {
  beforeEach(() => {
    // "Today" is fixed to July 15, 2026 for every test in this block.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'paid' when the bill's merchant has a transaction this month", () => {
    const bill = { merchant: "Netflix", dueDay: 5 };
    expect(computeBillStatus(bill, new Set(["netflix"]))).toBe("paid");
  });

  it("matches merchant names case-insensitively", () => {
    const bill = { merchant: "NETFLIX", dueDay: 5 };
    expect(computeBillStatus(bill, new Set(["netflix"]))).toBe("paid");
  });

  it("returns 'overdue' when the due day has already passed with no payment", () => {
    const bill = { merchant: "Electricity", dueDay: 12 };
    expect(computeBillStatus(bill, new Set())).toBe("overdue");
  });

  it("returns 'due' when the due day hasn't arrived yet", () => {
    const bill = { merchant: "Gym Membership", dueDay: 20 };
    expect(computeBillStatus(bill, new Set())).toBe("due");
  });

  it("returns 'due' rather than 'overdue' when today IS the due day", () => {
    // Regression test: this is the exact off-by-time-of-day bug found and
    // fixed while building the Recurring Bills page (comparing date-only
    // values, not full timestamps, so a bill isn't "overdue" the moment
    // midnight passes on its own due date).
    const bill = { merchant: "Rent", dueDay: 15 };
    expect(computeBillStatus(bill, new Set())).toBe("due");
  });

  it("does not throw when the bill has no merchant, and falls back to due-day logic", () => {
    const bill = { merchant: null, dueDay: 1 };
    expect(computeBillStatus(bill, new Set(["something"]))).toBe("overdue");
  });
});

describe("getCurrentMonthRange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the 1st of the current month as start and the 1st of next month as end", () => {
    const { start, end } = getCurrentMonthRange();
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(6); // July (0-indexed)
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(7); // August
    expect(end.getDate()).toBe(1);
  });
});
