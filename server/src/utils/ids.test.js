import { describe, it, expect } from "vitest";

const { parseId, MAX_ID } = require("./ids");

describe("parseId", () => {
  it("accepts plain positive integers, as strings or numbers", () => {
    expect(parseId("1")).toBe(1);
    expect(parseId("42")).toBe(42);
    expect(parseId(7)).toBe(7);
    expect(parseId(String(MAX_ID))).toBe(MAX_ID);
  });

  it("rejects strings that JavaScript would happily convert to a number", () => {
    for (const value of ["1.5", "0x1", "1e0", "1e3", " 1", "1 ", "+1", "-1", "01", "1_000", "Infinity"]) {
      expect(parseId(value)).toBeNull();
    }
  });

  it("rejects zero, negatives, non-integers and non-numeric input", () => {
    for (const value of ["0", 0, -3, 1.5, NaN, "abc", "", null, undefined, {}, [], ["1"], true]) {
      expect(parseId(value)).toBeNull();
    }
  });

  it("rejects ids larger than an Int column can hold", () => {
    expect(parseId(String(MAX_ID + 1))).toBeNull();
    expect(parseId(MAX_ID + 1)).toBeNull();
    expect(parseId("99999999999")).toBeNull();
    expect(parseId("999999999999999999999")).toBeNull();
  });
});
