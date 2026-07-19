import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

const app = require("../src/app");
const prisma = require("../src/prismaClient");

describe("Budgets API", () => {
  let categoryId;
  let budgetId;

  afterEach(async () => {
    if (budgetId) {
      await prisma.budget.deleteMany({ where: { id: budgetId } });
      budgetId = null;
    }
    if (categoryId) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
      categoryId = null;
    }
  });

  it("rejects creating a second budget for the same category with a clean 409", async () => {
    // Regression test: this used to leak a raw Prisma error (including the
    // server's file path) with a 500 status before the error handler was
    // taught to translate P2002 into a clean 409.
    const category = await prisma.category.create({
      data: { name: `Test Category ${Date.now()}`, color: "#123456" },
    });
    categoryId = category.id;

    const first = await request(app)
      .post("/api/budgets")
      .send({ categoryId, limitAmount: 100, period: "monthly" });
    expect(first.status).toBe(201);
    budgetId = first.body.id;

    const second = await request(app)
      .post("/api/budgets")
      .send({ categoryId, limitAmount: 200, period: "monthly" });
    expect(second.status).toBe(409);
    expect(second.body.error).toMatch(/already exists/);
    expect(second.body.error).not.toMatch(/at Object|\.js:\d+/); // no stack trace leaked
  });

  it("rejects a non-positive limitAmount with a validation error, not a crash", async () => {
    const category = await prisma.category.create({
      data: { name: `Test Category ${Date.now()}`, color: "#123456" },
    });
    categoryId = category.id;

    const res = await request(app).post("/api/budgets").send({ categoryId, limitAmount: -50 });
    expect(res.status).toBe(400);
  });
});
