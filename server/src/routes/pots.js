const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const validate = require("../middleware/validate");
const { potCreateSchema, potUpdateSchema, potAmountSchema } = require("../schemas/potSchema");

router.get("/", async (req, res, next) => {
  try {
    const pots = await prisma.pot.findMany({ orderBy: { name: "asc" } });
    res.json(pots);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const pot = await prisma.pot.findUnique({ where: { id: Number(req.params.id) } });
    if (!pot) return res.status(404).json({ error: "Pot not found" });
    res.json(pot);
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(potCreateSchema), async (req, res, next) => {
  try {
    const { name, targetAmount, color } = req.body;
    const pot = await prisma.pot.create({ data: { name, targetAmount, color } });
    res.status(201).json(pot);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate(potUpdateSchema), async (req, res, next) => {
  try {
    const { name, targetAmount, color } = req.body;
    const pot = await prisma.pot.update({
      where: { id: Number(req.params.id) },
      data: { name, targetAmount, color },
    });
    res.json(pot);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.pot.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/:id/deposit", validate(potAmountSchema), async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    const pot = await prisma.pot.update({
      where: { id: Number(req.params.id) },
      data: { currentAmount: { increment: amount } },
    });
    res.json(pot);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/withdraw", validate(potAmountSchema), async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    const pot = await prisma.$transaction(async (tx) => {
      const current = await tx.pot.findUnique({ where: { id: Number(req.params.id) } });
      if (!current) throw Object.assign(new Error("Pot not found"), { status: 404 });
      if (Number(current.currentAmount) < amount) {
        throw Object.assign(new Error("Cannot withdraw more than the pot balance"), {
          status: 400,
        });
      }
      return tx.pot.update({
        where: { id: Number(req.params.id) },
        data: { currentAmount: { decrement: amount } },
      });
    });
    res.json(pot);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
