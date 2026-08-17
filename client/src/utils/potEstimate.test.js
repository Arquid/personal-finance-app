import { describe, it, expect } from "vitest";
import { getPotEstimate } from "./potEstimate";

describe("getPotEstimate", () => {
  it("returns 'reached' when the current amount meets the target", () => {
    const pot = { currentAmount: "2000", targetAmount: "2000", createdAt: "2026-01-01" };
    expect(getPotEstimate(pot, new Date(2026, 5, 1)).status).toBe("reached");
  });

  it("returns 'reached' when the pot is over-funded", () => {
    const pot = { currentAmount: "2500", targetAmount: "2000", createdAt: "2026-01-01" };
    expect(getPotEstimate(pot, new Date(2026, 5, 1)).status).toBe("reached");
  });

  it("returns 'no-data' when nothing has been saved yet", () => {
    const pot = { currentAmount: "0", targetAmount: "2000", createdAt: "2026-01-01" };
    expect(getPotEstimate(pot, new Date(2026, 5, 1)).status).toBe("no-data");
  });

  it("returns 'no-data' when createdAt is missing or invalid", () => {
    const pot = { currentAmount: "500", targetAmount: "2000", createdAt: undefined };
    expect(getPotEstimate(pot, new Date(2026, 5, 1)).status).toBe("no-data");
  });

  it("projects a completion date from the average daily deposit rate", () => {
    const createdAt = new Date(2026, 0, 1);
    const today = new Date(2026, 0, 1);
    today.setDate(today.getDate() + 100);
    const pot = { currentAmount: "500", targetAmount: "2000", createdAt };

    const result = getPotEstimate(pot, today);
    expect(result.status).toBe("estimated");

    const expected = new Date(today);
    expected.setDate(expected.getDate() + 300);
    expect(result.date.toDateString()).toBe(expected.toDateString());
  });

  it("treats less than a day since creation as at least one day, to avoid a division by zero", () => {
    const createdAt = new Date(2026, 0, 1, 10, 0, 0);
    const today = new Date(2026, 0, 1, 11, 0, 0);
    const pot = { currentAmount: "10", targetAmount: "20", createdAt };
    const result = getPotEstimate(pot, today);
    expect(result.status).toBe("estimated");
  });
});