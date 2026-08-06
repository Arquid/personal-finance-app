import { describe, it, expect } from "vitest";
import { getDaysUntilDue, getBillsNeedingReminder } from "./billReminders";

describe("getDaysUntilDue", () => {
  it("returns 0 when the due day is today", () => {
    const today = new Date(2026, 5, 15);
    expect(getDaysUntilDue(15, today)).toBe(0);
  });

  it("returns a positive number when the due day is later this month", () => {
    const today = new Date(2026, 5, 15);
    expect(getDaysUntilDue(20, today)).toBe(5);
  });

  it("returns a negative number when the due day has already passed", () => {
    const today = new Date(2026, 5, 15);
    expect(getDaysUntilDue(10, today)).toBe(-5);
  });
});

describe("getBillsNeedingReminder", () => {
  const today = new Date(2026, 5, 15);

  it("includes overdue bills regardless of how many days have passed", () => {
    const bills = [{ id: 1, name: "Rent", dueDay: 1, status: "overdue" }];
    expect(getBillsNeedingReminder(bills, today)).toHaveLength(1);
  });

  it("includes due bills within the next 3 days", () => {
    const bills = [{ id: 1, name: "Netflix", dueDay: 17, status: "due" }];
    expect(getBillsNeedingReminder(bills, today)).toHaveLength(1);
  });

  it("excludes due bills more than 3 days away", () => {
    const bills = [{ id: 1, name: "Gym", dueDay: 25, status: "due" }];
    expect(getBillsNeedingReminder(bills, today)).toHaveLength(0);
  });

  it("excludes paid bills even if overdue", () => {
    const bills = [{ id: 1, name: "Rent", dueDay: 1, status: "paid" }];
    expect(getBillsNeedingReminder(bills, today)).toHaveLength(0);
  });
});