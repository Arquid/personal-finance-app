import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

const app = require("../src/app");
const prisma = require("../src/prismaClient");

describe("Categories API", () => {
  let categoryId;

  afterEach(async () => {
    if (categoryId) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
      categoryId = null;
    }
  });

  it("creates a custom category", async () => {
    const res = await request(app)
      .post("/api/categories")
      .send({ name: `Test Category ${Date.now()}`, color: "#6c5ce7" });
    expect(res.status).toBe(201);
    expect(res.body.isCustom).toBe(true);
    categoryId = res.body.id;
  });

  it("rejects an empty name", async () => {
    const res = await request(app).post("/api/categories").send({ name: "" });
    expect(res.status).toBe(400);
  });

  it("rejects a duplicate category name with a clean 409", async () => {
    const name = `Duplicate Category ${Date.now()}`;
    const first = await request(app).post("/api/categories").send({ name });
    expect(first.status).toBe(201);
    categoryId = first.body.id;

    const second = await request(app).post("/api/categories").send({ name });
    expect(second.status).toBe(409);
    expect(second.body.error).toMatch(/already exists/);
  });

  it("includes the new category in the category list", async () => {
    const createRes = await request(app)
      .post("/api/categories")
      .send({ name: `List Test Category ${Date.now()}` });
    categoryId = createRes.body.id;

    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(200);
    expect(res.body.some((c) => c.id === categoryId)).toBe(true);
  });
});