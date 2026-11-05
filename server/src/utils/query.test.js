import { describe, it, expect } from "vitest";

const { queryString, queryAccountId, MAX_PAGE } = require("./query");

const req = (query) => ({ query });

describe("queryString", () => {
  it("returns a trimmed string, or an empty string when the parameter is absent", () => {
    expect(queryString(req({ search: "  coffee " }), "search")).toBe("coffee");
    expect(queryString(req({}), "search")).toBe("");
  });

  it("rejects repeated or nested parameters with a 400 instead of crashing on .trim()", () => {
    for (const value of [["a", "b"], { a: "1" }]) {
      let error;
      try {
        queryString(req({ search: value }), "search");
      } catch (err) {
        error = err;
      }
      expect(error?.status).toBe(400);
      expect(error?.message).toBe("Invalid query parameter: search");
    }
  });
});

describe("queryAccountId", () => {
  it("returns undefined when the filter is absent or blank", () => {
    expect(queryAccountId(req({}))).toBeUndefined();
    expect(queryAccountId(req({ accountId: "" }))).toBeUndefined();
    expect(queryAccountId(req({ accountId: "  " }))).toBeUndefined();
  });

  it("returns the id for a valid value", () => {
    expect(queryAccountId(req({ accountId: "12" }))).toBe(12);
  });

  it("throws a 400 for anything that isn't a strict id", () => {
    for (const value of ["abc", "1.5", "0x1", "0", "-2", ["1", "2"]]) {
      let error;
      try {
        queryAccountId(req({ accountId: value }));
      } catch (err) {
        error = err;
      }
      expect(error?.status).toBe(400);
    }
  });
});

describe("MAX_PAGE", () => {
  it("is a finite sane bound", () => {
    expect(Number.isSafeInteger(MAX_PAGE)).toBe(true);
    expect(MAX_PAGE * 100).toBeLessThan(2 ** 31);
  });
});
