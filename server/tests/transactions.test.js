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
    // Regression test: sortBy is used directly as a Prisma orderBy key, so it
    // must be whitelisted rather than passed through unchecked.
    const res = await request(app)
      .get("/api/transactions")
      .query({ sortBy: "'; DROP TABLE", accountId });
    expect(res.status).toBe(200);
  });
});
