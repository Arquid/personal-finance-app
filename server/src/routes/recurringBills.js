const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const validate = require("../middleware/validate");
const {
  recurringBillCreateSchema,
  recurringBillUpdateSchema,
} = require("../schemas/recurringBillSchema");
const { getCurrentMonthRange, computeBillStatus } = require("../utils/recurringBillStatus");

router.get("/", async (req, res, next) => {
  try {
    const bills = await prisma.recurringBill.findMany({
      include: { category: true },
      orderBy: { dueDay: "asc" },
    });

    const { start, end } = getCurrentMonthRange();
    const thisMonthTransactions = await prisma.transaction.findMany({
      where: { date: { gte: start, lt: end }, merchant: { not: null } },
      select: { merchant: true },
    });
    const paidMerchants = new Set(thisMonthTransactions.map((t) => t.merchant.toLowerCase()));

    const billsWithStatus = bills.map((bill) => ({
      ...bill,
      status: computeBillStatus(bill, paidMerchants),
    }));

    res.json(billsWithStatus);
  } catch (err) {
    next(err);
  }
});

router.get("/detect", async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { merchant: { not: null }, amount: { lt: 0 } },
      orderBy: { date: "asc" },
      select: { merchant: true, amount: true, date: true, categoryId: true },
    });

    const byMerchant = new Map();
    for (const t of transactions) {
      const key = t.merchant.trim().toLowerCase();
      if (!byMerchant.has(key)) byMerchant.set(key, []);
      byMerchant.get(key).push(t);
    }

    const existingBills = await prisma.recurringBill.findMany();
    const existingKeys = new Set(
      existingBills.map((b) => (b.merchant || b.name).trim().toLowerCase())
    );

    const candidates = [];

    for (const [merchantKey, txs] of byMerchant) {
      if (txs.length < 3) continue;
      if (existingKeys.has(merchantKey)) continue;

      const amounts = txs.map((t) => Math.abs(Number(t.amount)));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const consistentAmount = amounts.every((a) => Math.abs(a - avgAmount) / avgAmount <= 0.05);
      if (!consistentAmount) continue;

      const dates = txs.map((t) => new Date(t.date)).sort((a, b) => a - b);
      let monthlyGaps = 0;
      for (let i = 1; i < dates.length; i++) {
        const gapDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
        if (gapDays >= 25 && gapDays <= 35) monthlyGaps++;
      }
      if (monthlyGaps < dates.length - 2) continue;

      const lastTx = txs[txs.length - 1];
      candidates.push({
        merchant: lastTx.merchant,
        suggestedName: lastTx.merchant,
        averageAmount: Math.round(avgAmount * 100) / 100,
        occurrences: txs.length,
        suggestedDueDay: new Date(lastTx.date).getDate(),
        categoryId: lastTx.categoryId,
      });
    }

    res.json(candidates);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const bill = await prisma.recurringBill.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true },
    });
    if (!bill) return res.status(404).json({ error: "Recurring bill not found" });
    res.json(bill);
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(recurringBillCreateSchema), async (req, res, next) => {
  try {
    const { name, merchant, amount, dueDay, categoryId, isActive } = req.body;
    const bill = await prisma.recurringBill.create({
      data: {
        name,
        merchant: merchant ?? null,
        amount,
        dueDay: Number(dueDay),
        categoryId: categoryId ? Number(categoryId) : null,
        isActive,
      },
    });
    res.status(201).json(bill);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate(recurringBillUpdateSchema), async (req, res, next) => {
  try {
    const { name, merchant, amount, dueDay, categoryId, isActive } = req.body;
    const bill = await prisma.recurringBill.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        merchant: "merchant" in req.body ? merchant : undefined,
        amount,
        dueDay: dueDay ? Number(dueDay) : undefined,
        categoryId:
          categoryId === undefined ? undefined : categoryId === null ? null : Number(categoryId),
        isActive,
      },
    });
    res.json(bill);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.recurringBill.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
