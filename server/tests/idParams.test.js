import { describe, it, expect } from "vitest";
import request from "supertest";

const app = require("../src/app");

// Every router with an :id route shares one param validator, so a malformed id
// is a 400 everywhere. Before, "abc" reached the database and came back as a
// 500 carrying Prisma's message, while "1.5", "0x1" and "1e0" were quietly
// treated as id 1.
const resources = ["accounts", "budgets", "pots", "transactions", "recurring-bills"];
const badIds = ["abc", "1.5", "0x1", "1e0", "0", "-1", "99999999999"];

describe.each(resources)("/api/%s/:id", (resource) => {
  it.each(badIds)("answers GET with malformed id %s with a 400 and no server internals", async (id) => {
    const res = await request(app).get(`/api/${resource}/${id}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid id" });
  });

  it("rejects a malformed id on PUT and DELETE too", async () => {
    const put = await request(app).put(`/api/${resource}/abc`).send({});
    const del = await request(app).delete(`/api/${resource}/1.5`);
    expect(put.status).toBe(400);
    expect(del.status).toBe(400);
  });

  it("still answers a well-formed id that doesn't exist with a 404", async () => {
    const res = await request(app).delete(`/api/${resource}/999999`);
    expect(res.status).toBe(404);
  });
});

describe("id validation on nested and literal routes", () => {
  it("validates the id of pot deposit and withdraw routes", async () => {
    const deposit = await request(app).post("/api/pots/abc/deposit").send({ amount: 5 });
    const withdraw = await request(app).post("/api/pots/1.5/withdraw").send({ amount: 5 });
    expect(deposit.status).toBe(400);
    expect(withdraw.status).toBe(400);
  });

  it("does not mistake literal routes for ids", async () => {
    const detect = await request(app).get("/api/recurring-bills/detect");
    const exported = await request(app).get("/api/transactions/export");
    const suggest = await request(app).get("/api/transactions/suggest-category").query({ merchant: "x" });
    expect(detect.status).toBe(200);
    expect(exported.status).toBe(200);
    expect(suggest.status).toBe(200);
  });
});

describe("body ids", () => {
  it("rejects a transfer between accounts with an id too large for the database", async () => {
    const res = await request(app)
      .post("/api/accounts/transfer")
      .send({ fromAccountId: 1, toAccountId: 99999999999, amount: 5 });
    expect(res.status).toBe(400);
  });

  it("rejects a transaction whose accountId is too large for the database", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .send({ amount: -5, description: "x", date: "2026-01-01", accountId: 99999999999 });
    expect(res.status).toBe(400);
  });
});
