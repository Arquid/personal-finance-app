import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

const app = require("../src/app");
const prisma = require("../src/prismaClient");

describe("Pots API", () => {
  let potId;

  afterEach(async () => {
    if (potId) {
      await prisma.pot.deleteMany({ where: { id: potId } });
      potId = null;
    }
  });

  it("creates a pot", async () => {
    const res = await request(app)
      .post("/api/pots")
      .send({ name: "Test Pot", targetAmount: 1000, color: "#000000" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Pot");
    potId = res.body.id;
  });

  it("deposits money into a pot", async () => {
    const createRes = await request(app)
      .post("/api/pots")
      .send({ name: "Deposit Test", targetAmount: 1000, color: "#000" });
    potId = createRes.body.id;

    const res = await request(app).post(`/api/pots/${potId}/deposit`).send({ amount: 100 });
    expect(res.status).toBe(200);
    expect(Number(res.body.currentAmount)).toBe(100);
  });

  it("rejects a withdrawal larger than the balance", async () => {
    const createRes = await request(app)
      .post("/api/pots")
      .send({ name: "Withdraw Test", targetAmount: 1000, color: "#000" });
    potId = createRes.body.id;
    await request(app).post(`/api/pots/${potId}/deposit`).send({ amount: 50 });

    const res = await request(app).post(`/api/pots/${potId}/withdraw`).send({ amount: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/withdraw more than/);
  });

  it("rejects a negative deposit amount", async () => {
    const createRes = await request(app)
      .post("/api/pots")
      .send({ name: "Negative Deposit Test", targetAmount: 1000, color: "#000" });
    potId = createRes.body.id;

    const res = await request(app).post(`/api/pots/${potId}/deposit`).send({ amount: -50 });
    expect(res.status).toBe(400);
  });

  it("never lets concurrent withdrawals over-draw the balance", async () => {
    // Regression test for the race-condition fix: the withdraw route used to
    // read the balance and update it in two separate steps, so two
    // concurrent requests could both pass the balance check against the
    // same stale value. It's now a single atomic conditional UPDATE.
    const createRes = await request(app)
      .post("/api/pots")
      .send({ name: "Concurrency Test", targetAmount: 2000, color: "#000" });
    potId = createRes.body.id;
    await request(app).post(`/api/pots/${potId}/deposit`).send({ amount: 1500 });

    // Fire 10 concurrent withdrawals of 200 against a balance of 1500.
    // At most 7 can succeed (7 * 200 = 1400); the rest must be rejected.
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app).post(`/api/pots/${potId}/withdraw`).send({ amount: 200 }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 200);
    const failed = results.filter((r) => r.status === 400);
    expect(succeeded.length).toBe(7);
    expect(failed.length).toBe(3);

    const finalPot = await prisma.pot.findUnique({ where: { id: potId } });
    expect(Number(finalPot.currentAmount)).toBe(100);
  });
});
