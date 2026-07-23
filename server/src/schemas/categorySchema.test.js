import { describe, it, expect } from "vitest";

const { categoryCreateSchema } = require("./categorySchema");

describe("categoryCreateSchema", () => {
  it("accepts a valid category name", () => {
    expect(categoryCreateSchema.safeParse({ name: "Subscriptions" }).success).toBe(true);
  });

  it("accepts an optional color", () => {
    expect(
      categoryCreateSchema.safeParse({ name: "Subscriptions", color: "#6c5ce7" }).success,
    ).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(categoryCreateSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects a missing name", () => {
    expect(categoryCreateSchema.safeParse({ color: "#6c5ce7" }).success).toBe(false);
  });
});