const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const validate = require("../middleware/validate");
const multer = require("multer");
const { parse } = require("csv-parse/sync");

const {
  transactionCreateSchema,
  transactionUpdateSchema,
} = require("../schemas/transactionSchema");
const { getBudgetAlert } = require("../utils/budgetAlert");

const SORTABLE_FIELDS = ["date", "amount", "description", "merchant"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.toLowerCase().endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error("Only CSV files are allowed"), { status: 400 }));
    }
  },
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = (req.query.search || "").trim();
    const sortBy = SORTABLE_FIELDS.includes(req.query.sortBy) ? req.query.sortBy : "date";
    const order = req.query.order === "asc" ? "asc" : "desc";
    const { category, accountId } = req.query;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { description: { contains: search, mode: "insensitive" } },
                { merchant: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        category ? { category: { name: category } } : {},
        accountId ? { accountId: Number(accountId) } : {},
      ],
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true, account: true },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true, account: true },
    });
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    next(err);
  }
});

router.post("/", validate(transactionCreateSchema), async (req, res, next) => {
  try {
    const { amount, description, merchant, date, accountId, categoryId } = req.body;
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        merchant: merchant ?? null,
        date,
        accountId,
        categoryId: categoryId ?? null,
      },
    });
    const budgetAlert = await getBudgetAlert(transaction.categoryId);
    res.status(201).json({ ...transaction, budgetAlert });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validate(transactionUpdateSchema), async (req, res, next) => {
  try {
    const { amount, description, merchant, date, accountId } = req.body;
    const transaction = await prisma.transaction.update({
      where: { id: Number(req.params.id) },
      data: {
        amount,
        description,
        merchant,
        date,
        accountId,
        categoryId: "categoryId" in req.body ? req.body.categoryId : undefined,
      },
    });
    const budgetAlert = await getBudgetAlert(transaction.categoryId);
    res.json({ ...transaction, budgetAlert });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.transaction.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/import", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const accountId = Number(req.body.accountId);
    if (!accountId) return res.status(400).json({ error: "accountId is required" });

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return res.status(400).json({ error: "Account not found" });

    let records;
    try {
      records = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true });
    } catch (parseErr) {
      return res.status(400).json({ error: `Failed to parse CSV: ${parseErr.message}` });
    }

    if (records.length === 0) {
      return res.status(400).json({ error: "CSV file is empty or has no valid rows" });
    }

    const categories = await prisma.category.findMany();
    const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

    const validRows = [];
    const errors = [];

    records.forEach((row, index) => {
      const rowNum = index + 2; // +1 for header row, +1 for 1-based counting
      const amount = parseFloat(row.amount);
      const date = new Date(row.date);

      if (!row.description || !row.description.trim()) {
        errors.push({ row: rowNum, error: "Description is required" });
        return;
      }
      if (isNaN(amount) || amount === 0) {
        errors.push({ row: rowNum, error: "Amount must be a non-zero number" });
        return;
      }
      if (isNaN(date.getTime())) {
        errors.push({ row: rowNum, error: "Invalid date" });
        return;
      }

      const categoryId = row.category
        ? (categoryByName.get(row.category.trim().toLowerCase()) ?? null)
        : null;

      validRows.push({
        amount,
        description: row.description.trim(),
        merchant: row.merchant ? row.merchant.trim() : null,
        date,
        accountId,
        categoryId,
      });
    });

    let imported = 0;
    if (validRows.length > 0) {
      const result = await prisma.transaction.createMany({ data: validRows });
      imported = result.count;
    }

    res.status(imported > 0 ? 201 : 400).json({
      imported,
      skipped: errors.length,
      totalRows: records.length,
      errors,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
