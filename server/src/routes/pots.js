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
    const id = Number(req.params.id);

    // Atomic conditional update: the balance check and the decrement happen in a
    // single statement, so two concurrent withdrawals can't both pass the check
    // against the same stale balance (unlike a separate read-then-write).
    const updated = await prisma.$queryRaw`
      UPDATE "Pot"
      SET "currentAmount" = "currentAmount" - ${amount}
      WHERE id = ${id} AND "currentAmount" >= ${amount}
      RETURNING *
    `;

    if (updated.length === 0) {
      const existing = await prisma.pot.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Pot not found" });
      }
      return res.status(400).json({ error: "Cannot withdraw more than the pot balance" });
    }

    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
