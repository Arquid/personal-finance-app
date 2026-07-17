const z = require("zod");

const transactionCreateSchema = z.object({
  amount: z.coerce.number().refine((v) => v !== 0, "Amount cannot be zero"),
  description: z.string().min(1, "Description is required").max(255),
  merchant: z.string().max(255).optional().nullable(),
  date: z.coerce.date({ error: "A valid date is required" }),
  accountId: z.coerce.number().int().positive("Account is required"),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
});

const transactionUpdateSchema = transactionCreateSchema.partial();

module.exports = { transactionCreateSchema, transactionUpdateSchema };
