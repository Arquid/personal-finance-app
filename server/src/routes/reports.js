const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

router.get("/overview", async (req, res, next) => {
  try {
    const { start, end } = monthRange();

    const [accounts, incomeAgg, expenseAgg, latestTransactions, pots] = await Promise.all([
      prisma.account.findMany(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { amount: { gt: 0 }, date: { gte: start, lt: end } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { amount: { lt: 0 }, date: { gte: start, lt: end } },
      }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { date: "desc" },
        include: { category: true, account: true },
      }),
      prisma.pot.findMany(),
    ]);

    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

    res.json({
      totalBalance,
      accounts,
      monthlyIncome: Number(incomeAgg._sum.amount || 0),
      monthlyExpenses: Math.abs(Number(expenseAgg._sum.amount || 0)),
      latestTransactions,
      pots,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/spending-by-category", async (req, res, next) => {
  try {
    const { start, end } = monthRange();

    const grouped = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { amount: { lt: 0 }, date: { gte: start, lt: end }, categoryId: { not: null } },
      _sum: { amount: true },
    });

    const categories = await prisma.category.findMany({
      where: { id: { in: grouped.map((g) => g.categoryId) } },
    });
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    const result = grouped
      .map((g) => ({
        categoryId: g.categoryId,
        category: categoryMap[g.categoryId]?.name,
        color: categoryMap[g.categoryId]?.color,
        total: Math.abs(Number(g._sum.amount)),
      }))
      .sort((a, b) => b.total - a.total);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/budget-vs-actual", async (req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        c.id AS "categoryId",
        c.name AS category,
        c.color AS color,
        b."limitAmount" AS "limitAmount",
        COALESCE(SUM(
          CASE WHEN t.amount < 0 AND t.date >= date_trunc('month', CURRENT_DATE) THEN -t.amount ELSE 0 END
        ), 0) AS actual
      FROM "Budget" b
      JOIN "Category" c ON c.id = b."categoryId"
      LEFT JOIN "Transaction" t ON t."categoryId" = c.id
      GROUP BY c.id, c.name, c.color, b."limitAmount"
      ORDER BY c.name
    `;

    const result = rows.map((r) => {
      const limit = Number(r.limitAmount);
      const actual = Number(r.actual);
      const percentage = limit > 0 ? Math.round((actual / limit) * 100) : 0;
      return {
        categoryId: r.categoryId,
        category: r.category,
        color: r.color,
        limitAmount: limit,
        actual,
        percentage,
        status: percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "ok",
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/latest-by-category", async (req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT * FROM (
        SELECT
          t.id, t.amount, t.description, t.merchant, t.date, t."categoryId",
          c.name AS category, c.color AS color,
          (ROW_NUMBER() OVER (PARTITION BY t."categoryId" ORDER BY t.date DESC))::int AS rn
        FROM "Transaction" t
        JOIN "Category" c ON c.id = t."categoryId"
        WHERE t."categoryId" IN (SELECT "categoryId" FROM "Budget")
      ) sub
      WHERE sub.rn <= 3
      ORDER BY sub."categoryId", sub.date DESC
    `;

    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.categoryId]) {
        grouped[row.categoryId] = {
          categoryId: row.categoryId,
          category: row.category,
          color: row.color,
          transactions: [],
        };
      }
      grouped[row.categoryId].transactions.push({
        id: row.id,
        amount: Number(row.amount),
        description: row.description,
        merchant: row.merchant,
        date: row.date,
      });
    }

    res.json(Object.values(grouped));
  } catch (err) {
    next(err);
  }
});

router.get("/monthly-trend", async (req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', t.date) AS month,
        SUM(CASE WHEN t.amount < 0 THEN -t.amount ELSE 0 END) AS expenses,
        SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) AS income,
        SUM(SUM(CASE WHEN t.amount < 0 THEN -t.amount ELSE 0 END))
          OVER (ORDER BY DATE_TRUNC('month', t.date)) AS "runningExpenses"
      FROM "Transaction" t
      GROUP BY DATE_TRUNC('month', t.date)
      ORDER BY month
    `;

    const result = rows.map((r) => ({
      month: r.month,
      expenses: Number(r.expenses),
      income: Number(r.income),
      runningExpenses: Number(r.runningExpenses),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
