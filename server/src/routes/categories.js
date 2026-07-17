const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

router.get("/", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

module.exports = router;