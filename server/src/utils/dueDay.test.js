import { describe, it, expect } from "vitest";

const { daysInMonth, effectiveDueDay } = require("./dueDay");

describe("daysInMonth", () => {
  it("returns 31 for a 31-day month", () => {
    expect(daysInMonth(2026, 0)).toBe(31); // January
  });

  it("returns 30 for a 30-day month", () => {
    expect(daysInMonth(2026, 3)).toBe(30); // April
  });

  it("returns 28 for February in a non-leap year", () => {
    expect(daysInMonth(2026, 1)).toBe(28);
  });

  it("returns 29 for February in a leap year", () => {
    expect(daysInMonth(2024, 1)).toBe(29);
  });
});

describe("effectiveDueDay", () => {
  it("returns the bill's dueDay unchanged when it fits in the month", () => {
    expect(effectiveDueDay({ dueDay: 15 }, 2026, 1)).toBe(15); // February
    expect(effectiveDueDay({ dueDay: 31 }, 2026, 0)).toBe(31); // January has 31 days
  });

  it("caps a dueDay of 31 to the last day of a shorter month", () => {
    expect(effectiveDueDay({ dueDay: 31 }, 2026, 3)).toBe(30); // April
    expect(effectiveDueDay({ dueDay: 31 }, 2026, 1)).toBe(28); // February, non-leap
    expect(effectiveDueDay({ dueDay: 31 }, 2024, 1)).toBe(29); // February, leap year
  });

  it("caps a dueDay of 30 to 28/29 in February but leaves it unchanged elsewhere", () => {
    expect(effectiveDueDay({ dueDay: 30 }, 2026, 1)).toBe(28);
    expect(effectiveDueDay({ dueDay: 30 }, 2026, 3)).toBe(30);
  });
});
