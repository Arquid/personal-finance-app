const z = require("zod");
const { idField } = require("./ids");
const { money } = require("./money");

const transactionCreateSchema = z.object({
  amount: money().refine((v) => v !== 0, "Amount cannot be zero"),
  description: z.string().trim().min(1, "Description is required").max(255),
  merchant: z.string().trim().max(255).optional().nullable(),
  date: z.coerce.date({ error: "A valid date is required" }),
  accountId: idField("Account is required"),
  categoryId: idField("Category is invalid").optional().nullable(),
});

const transactionUpdateSchema = transactionCreateSchema.partial();

module.exports = { transactionCreateSchema, transactionUpdateSchema };
