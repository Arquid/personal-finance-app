const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const validate = require("../middleware/validate");
const { accountCreateSchema, accountUpdateSchema } = require("../schemas/accountSchema");

router.get("/", async (req, res, next) => {
  try {
    const accounts = await prisma.account.findMany({ orderBy: { name: "asc" } });
    res.json(accounts);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const account = await prisma.account.findUnique({ where: { id: Number(req.params.id) } });
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(accountCreateSchema), async (req, res, next) => {
  try {
    const { name, type, balance } = req.body;
    const account = await prisma.account.create({ data: { name, type, balance } });
    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate(accountUpdateSchema), async (req, res, next) => {
  try {
    const { name, type, balance } = req.body;
    const account = await prisma.account.update({
      where: { id: Number(req.params.id) },
      data: { name, type, balance },
    });
    res.json(account);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.account.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
