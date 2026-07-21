import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

const app = require("../src/app");
const prisma = require("../src/prismaClient");

describe("Recurring Bills API", () => {
  let billId;
  let accountId;
  const transactionIds = [];

  afterEach(async () => {
    if (billId) {
      await prisma.recurringBill.deleteMany({ where: { id: billId } });
      billId = null;
    }
    if (transactionIds.length) {
      await prisma.transaction.deleteMany({ where: { id: { in: transactionIds } } });
      transactionIds.length = 0;
    }
    if (accountId) {
      await prisma.account.deleteMany({ where: { id: accountId } });
      accountId = null;
    }
  });

  it("creates a recurring bill", async () => {
    const res = await request(app)
      .post("/api/recurring-bills")
      .send({ name: "Test Subscription", amount: 12.99, dueDay: 10 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Subscription");
    billId = res.body.id;
  });

  it("rejects a dueDay outside 1-31", async () => {
    const res = await request(app)
      .post("/api/recurring-bills")
      .send({ name: "Bad Due Day", amount: 10, dueDay: 45 });
    expect(res.status).toBe(400);
  });

  it("includes a computed status for each bill in the list", async () => {
    const createRes = await request(app)
      .post("/api/recurring-bills")
      .send({ name: `Status Test Bill ${Date.now()}`, amount: 20, dueDay: 15 });
    billId = createRes.body.id;

    const res = await request(app).get("/api/recurring-bills");
    expect(res.status).toBe(200);
    const created = res.body.find((b) => b.id === billId);
    expect(created).toBeDefined();
    expect(["paid", "due", "overdue"]).toContain(created.status);
  });

  it("detects a recurring payment pattern from 3 monthly-spaced transactions", async () => {
    const account = await prisma.account.create({
      data: { name: `Detect Test Account ${Date.now()}`, type: "checking", balance: 0 },
    });
    accountId = account.id;

    const merchant = `Detect Test Merchant ${Date.now()}`;
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 10);
      const tx = await prisma.transaction.create({
        data: { amount: -15, description: merchant, merchant, date, accountId },
      });
      transactionIds.push(tx.id);
    }

    const res = await request(app).get("/api/recurring-bills/detect");
    expect(res.status).toBe(200);
    const candidate = res.body.find((c) => c.merchant === merchant);
    expect(candidate).toBeDefined();
    expect(candidate.occurrences).toBe(3);
    expect(candidate.averageAmount).toBe(15);
  });

  it("does not suggest a merchant that already has a recurring bill", async () => {
    const merchant = `Already Tracked Merchant ${Date.now()}`;
    const account = await prisma.account.create({
      data: { name: `Detect Test Account ${Date.now()}`, type: "checking", balance: 0 },
    });
    accountId = account.id;

    const bill = await prisma.recurringBill.create({
      data: { name: merchant, merchant, amount: 15, dueDay: 10 },
    });
    billId = bill.id;

    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 10);
      const tx = await prisma.transaction.create({
        data: { amount: -15, description: merchant, merchant, date, accountId },
      });
      transactionIds.push(tx.id);
    }

    const res = await request(app).get("/api/recurring-bills/detect");
    expect(res.status).toBe(200);
    expect(res.body.find((c) => c.merchant === merchant)).toBeUndefined();
  });

  it("deletes a recurring bill", async () => {
    const createRes = await request(app)
      .post("/api/recurring-bills")
      .send({ name: "Delete Test Bill", amount: 5, dueDay: 1 });
    const id = createRes.body.id;

    const res = await request(app).delete(`/api/recurring-bills/${id}`);
    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/api/recurring-bills/${id}`);
    expect(getRes.status).toBe(404);
  });
});
