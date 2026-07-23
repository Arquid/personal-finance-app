const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const validate = require("../middleware/validate");
const { categoryCreateSchema } = require("../schemas/categorySchema");

router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(categoryCreateSchema), async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const category = await prisma.category.create({
      data: { name, color: color || undefined, isCustom: true },
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

module.exports = router;