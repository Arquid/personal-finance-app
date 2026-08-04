import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";

const app = require("../src/app");
const prisma = require("../src/prismaClient");

describe("Transactions API", () => {
  let accountId;
  const createdIds = [];

  beforeAll(async () => {
    const account = await prisma.account.create({
      data: { name: `Test Account ${Date.now()}`, type: "checking", balance: 0 },
    });
    accountId = account.id;

    for (let i = 0; i < 3; i++) {
      const tx = await prisma.transaction.create({
        data: {
          amount: -10 - i,
          description: `Integration test transaction ${i}`,
          date: new Date(),
          accountId,
        },
      });
      createdIds.push(tx.id);
    }
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.account.deleteMany({ where: { id: accountId } });
  });

  it("paginates results and reports correct totals", async () => {
    const res = await request(app)
      .get("/api/transactions")
      .query({ limit: 2, page: 1, accountId });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(3);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it("filters by search term", async () => {
    const res = await request(app)
      .get("/api/transactions")
      .query({ search: "Integration test transaction 1", accountId });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].description).toBe("Integration test transaction 1");
  });

  it("falls back to the default sort instead of crashing on an unwhitelisted sortBy", async () => {
    const res = await request(app)
      .get("/api/transactions")
      .query({ sortBy: "'; DROP TABLE", accountId });
    expect(res.status).toBe(200);
  });

  it("exports transactions as CSV with a header row and one row per transaction", async () => {
    const res = await request(app).get("/api/transactions/export").query({ accountId });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    const lines = res.text.trim().split("\n");
    expect(lines[0]).toBe("date,description,merchant,amount,category");
    expect(lines.length).toBe(4);
  });

  it("applies the same search filter as the list endpoint", async () => {
    const res = await request(app)
      .get("/api/transactions/export")
      .query({ accountId, search: "Integration test transaction 1" });
    expect(res.status).toBe(200);
    const lines = res.text.trim().split("\n");
    expect(lines.length).toBe(2);
    expect(lines[1]).toContain("Integration test transaction 1");
  });

  it("quotes a description that contains a comma", async () => {
    const tx = await prisma.transaction.create({
      data: { amount: -5, description: "Coffee, tea, and snacks", date: new Date(), accountId },
    });
    createdIds.push(tx.id);

    const res = await request(app)
      .get("/api/transactions/export")
      .query({ accountId, search: "Coffee, tea" });
    expect(res.status).toBe(200);
    expect(res.text).toContain('"Coffee, tea, and snacks"');
  });

    it("suggests the most-used category for a merchant", async () => {
    const category = await prisma.category.create({
      data: { name: `Suggest Category ${Date.now()}`, color: "#000000" },
    });
    const merchant = `Suggest Merchant ${Date.now()}`;

    const tx1 = await prisma.transaction.create({
      data: {
        amount: -10,
        description: "x",
        merchant,
        date: new Date(),
        accountId,
        categoryId: category.id,
      },
    });
    const tx2 = await prisma.transaction.create({
      data: {
        amount: -12,
        description: "y",
        merchant,
        date: new Date(),
        accountId,
        categoryId: category.id,
      },
    });

    const res = await request(app).get("/api/transactions/suggest-category").query({ merchant });
    expect(res.status).toBe(200);
    expect(res.body.categoryId).toBe(category.id);
    expect(res.body.categoryName).toBe(category.name);
    expect(res.body.count).toBe(2);

    await prisma.transaction.deleteMany({ where: { id: { in: [tx1.id, tx2.id] } } });
    await prisma.category.delete({ where: { id: category.id } });
  });

  it("returns null when no transactions match the merchant", async () => {
    const res = await request(app)
      .get("/api/transactions/suggest-category")
      .query({ merchant: `Nonexistent Merchant ${Date.now()}` });
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("rejects a missing merchant parameter", async () => {
    const res = await request(app).get("/api/transactions/suggest-category");
    expect(res.status).toBe(400);
  });
});
