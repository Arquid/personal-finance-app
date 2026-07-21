import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";

const app = require("../src/app");
const prisma = require("../src/prismaClient");

describe("Reports API", () => {
  let categoryId;
  let budgetId;
  let accountId;
  const transactionIds = [];

  afterEach(async () => {
    if (transactionIds.length) {
      await prisma.transaction.deleteMany({ where: { id: { in: transactionIds } } });
      transactionIds.length = 0;
    }
    if (budgetId) {
      await prisma.budget.deleteMany({ where: { id: budgetId } });
      budgetId = null;
    }
    if (categoryId) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
      categoryId = null;
    }
    if (accountId) {
      await prisma.account.deleteMany({ where: { id: accountId } });
      accountId = null;
    }
  });

  it("reflects a newly created account's balance in the overview", async () => {
    // Regression-safe by design: this asserts against an account this test
    // just created, not against a live sum of the whole accounts table.
    // Other test files run in parallel against the same database and freely
    // create/delete accounts, so comparing two separate full-table snapshots
    // (one from /reports/overview, one from /accounts) would be flaky.
    const account = await prisma.account.create({
      data: { name: `Overview Test Account ${Date.now()}`, type: "checking", balance: 250 },
    });
    accountId = account.id;

    const res = await request(app).get("/api/reports/overview");
    expect(res.status).toBe(200);
    expect(typeof res.body.totalBalance).toBe("number");

    const entry = res.body.accounts.find((a) => a.id === accountId);
    expect(entry).toBeDefined();
    expect(Number(entry.balance)).toBe(250);

    expect(Array.isArray(res.body.latestTransactions)).toBe(true);
    expect(typeof res.body.monthlyIncome).toBe("number");
    expect(typeof res.body.monthlyExpenses).toBe("number");
  });

  it("groups this month's spending by category", async () => {
    const category = await prisma.category.create({
      data: { name: `Report Category ${Date.now()}`, color: "#123456" },
    });
    categoryId = category.id;
    const account = await prisma.account.create({
      data: { name: `Report Account ${Date.now()}`, type: "checking", balance: 0 },
    });
    accountId = account.id;
    const tx = await prisma.transaction.create({
      data: {
        amount: -75,
        description: "Report test spend",
        date: new Date(),
        accountId,
        categoryId,
      },
    });
    transactionIds.push(tx.id);

    const res = await request(app).get("/api/reports/spending-by-category");
    expect(res.status).toBe(200);
    const entry = res.body.find((r) => r.categoryId === categoryId);
    expect(entry).toBeDefined();
    expect(entry.total).toBe(75);
  });

  it("computes budget-vs-actual percentage and status via the GROUP BY query", async () => {
    const category = await prisma.category.create({
      data: { name: `Budget Report Category ${Date.now()}`, color: "#654321" },
    });
    categoryId = category.id;
    const budget = await prisma.budget.create({
      data: { categoryId, limitAmount: 100, period: "monthly" },
    });
    budgetId = budget.id;
    const account = await prisma.account.create({
      data: { name: `Budget Report Account ${Date.now()}`, type: "checking", balance: 0 },
    });
    accountId = account.id;
    const tx = await prisma.transaction.create({
      data: {
        amount: -90,
        description: "Budget report spend",
        date: new Date(),
        accountId,
        categoryId,
      },
    });
    transactionIds.push(tx.id);

    const res = await request(app).get("/api/reports/budget-vs-actual");
    expect(res.status).toBe(200);
    const entry = res.body.find((r) => r.categoryId === categoryId);
    expect(entry).toBeDefined();
    expect(entry.actual).toBe(90);
    expect(entry.percentage).toBe(90);
    expect(entry.status).toBe("warning");
  });

  it("returns only the 3 most recent transactions per budgeted category via the window function", async () => {
    const category = await prisma.category.create({
      data: { name: `Latest Report Category ${Date.now()}`, color: "#abcdef" },
    });
    categoryId = category.id;
    const budget = await prisma.budget.create({
      data: { categoryId, limitAmount: 500, period: "monthly" },
    });
    budgetId = budget.id;
    const account = await prisma.account.create({
      data: { name: `Latest Report Account ${Date.now()}`, type: "checking", balance: 0 },
    });
    accountId = account.id;

    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const tx = await prisma.transaction.create({
        data: {
          amount: -(10 + i),
          description: `Latest report tx ${i}`,
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
          accountId,
          categoryId,
        },
      });
      transactionIds.push(tx.id);
    }

    const res = await request(app).get("/api/reports/latest-by-category");
    expect(res.status).toBe(200);
    const entry = res.body.find((r) => r.categoryId === categoryId);
    expect(entry).toBeDefined();
    expect(entry.transactions.length).toBe(3);
    expect(entry.transactions[0].description).toBe("Latest report tx 0");
  });

  it("returns the monthly trend as an array with a running total", async () => {
    const res = await request(app).get("/api/reports/monthly-trend");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(typeof res.body[0].expenses).toBe("number");
      expect(typeof res.body[0].runningExpenses).toBe("number");
    }
  });
});
