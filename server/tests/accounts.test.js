import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

const app = require("../src/app");
const prisma = require("../src/prismaClient");

describe("Accounts API", () => {
  let accountId;
  let fromId;
  let toId;

  afterEach(async () => {
    if (accountId) {
      await prisma.account.deleteMany({ where: { id: accountId } });
      accountId = null;
    }
    if (fromId) {
      await prisma.account.deleteMany({ where: { id: fromId } });
      fromId = null;
    }
    if (toId) {
      await prisma.account.deleteMany({ where: { id: toId } });
      toId = null;
    }
  });;

  it("creates an account", async () => {
    const res = await request(app)
      .post("/api/accounts")
      .send({ name: `Test Account ${Date.now()}`, type: "checking", balance: 500 });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe("checking");
    expect(Number(res.body.balance)).toBe(500);
    accountId = res.body.id;
  });

  it("rejects an invalid account type", async () => {
    const res = await request(app)
      .post("/api/accounts")
      .send({ name: `Test Account ${Date.now()}`, type: "crypto-wallet", balance: 0 });
    expect(res.status).toBe(400);
  });

  it("updates an account's balance", async () => {
    const createRes = await request(app)
      .post("/api/accounts")
      .send({ name: `Test Account ${Date.now()}`, type: "savings", balance: 0 });
    accountId = createRes.body.id;

    const res = await request(app).put(`/api/accounts/${accountId}`).send({ balance: 1200 });
    expect(res.status).toBe(200);
    expect(Number(res.body.balance)).toBe(1200);
  });

  it("returns 404 for an account that no longer exists", async () => {
    const createRes = await request(app)
      .post("/api/accounts")
      .send({ name: `Test Account ${Date.now()}`, type: "checking", balance: 0 });
    const id = createRes.body.id;

    const deleteRes = await request(app).delete(`/api/accounts/${id}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/api/accounts/${id}`);
    expect(getRes.status).toBe(404);
  });

  it("transfers money between two accounts", async () => {
    const from = await prisma.account.create({
      data: { name: `Transfer From ${Date.now()}`, type: "checking", balance: 500 },
    });
    fromId = from.id;
    const to = await prisma.account.create({
      data: { name: `Transfer To ${Date.now()}`, type: "savings", balance: 100 },
    });
    toId = to.id;

    const res = await request(app)
      .post("/api/accounts/transfer")
      .send({ fromAccountId: fromId, toAccountId: toId, amount: 200 });
    expect(res.status).toBe(200);
    expect(Number(res.body.from.balance)).toBe(300);
    expect(Number(res.body.to.balance)).toBe(300);
  });

  it("rejects a transfer larger than the source balance", async () => {
    const from = await prisma.account.create({
      data: { name: `Transfer From ${Date.now()}`, type: "checking", balance: 50 },
    });
    fromId = from.id;
    const to = await prisma.account.create({
      data: { name: `Transfer To ${Date.now()}`, type: "savings", balance: 0 },
    });
    toId = to.id;

    const res = await request(app)
      .post("/api/accounts/transfer")
      .send({ fromAccountId: fromId, toAccountId: toId, amount: 100 });
    expect(res.status).toBe(400);

    const unchanged = await prisma.account.findUnique({ where: { id: toId } });
    expect(Number(unchanged.balance)).toBe(0);
  });

  it("rejects a transfer to the same account", async () => {
    const account = await prisma.account.create({
      data: { name: `Transfer Self ${Date.now()}`, type: "checking", balance: 100 },
    });
    fromId = account.id;

    const res = await request(app)
      .post("/api/accounts/transfer")
      .send({ fromAccountId: fromId, toAccountId: fromId, amount: 10 });
    expect(res.status).toBe(400);
  });

  it("does not debit the source account if the destination account doesn't exist", async () => {
    const from = await prisma.account.create({
      data: { name: `Transfer From ${Date.now()}`, type: "checking", balance: 500 },
    });
    fromId = from.id;

    const res = await request(app)
      .post("/api/accounts/transfer")
      .send({ fromAccountId: fromId, toAccountId: 999999, amount: 100 });
    expect(res.status).toBe(404);

    const unchanged = await prisma.account.findUnique({ where: { id: fromId } });
    expect(Number(unchanged.balance)).toBe(500);
  });
});
