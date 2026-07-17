const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const validate = require("../middleware/validate");
const { budgetCreateSchema, budgetUpdateSchema } = require("../schemas/budgetSchema");

router.get("/", async (req, res, next) => {
  try {
    const budgets = await prisma.budget.findMany({ include: { category: true } });
    res.json(budgets);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true },
    });
    if (!budget) return res.status(404).json({ error: "Budget not found" });
    res.json(budget);
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(budgetCreateSchema), async (req, res, next) => {
  try {
    const { categoryId, limitAmount, period } = req.body;
    const budget = await prisma.budget.create({
      data: { categoryId: Number(categoryId), limitAmount, period },
    });
    res.status(201).json(budget);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate(budgetUpdateSchema), async (req, res, next) => {
  try {
    const { limitAmount, period } = req.body;
    const budget = await prisma.budget.update({
      where: { id: Number(req.params.id) },
      data: { limitAmount, period },
    });
    res.json(budget);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.budget.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
