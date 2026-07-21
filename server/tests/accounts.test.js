import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

const app = require("../src/app");
const prisma = require("../src/prismaClient");

describe("Accounts API", () => {
  let accountId;

  afterEach(async () => {
    if (accountId) {
      await prisma.account.deleteMany({ where: { id: accountId } });
      accountId = null;
    }
  });

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
});
