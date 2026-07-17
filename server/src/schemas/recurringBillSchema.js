const { z } = require("zod");

const recurringBillCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  merchant: z.string().max(255).optional().nullable(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  dueDay: z.coerce.number().int().min(1, "Day must be between 1 and 31").max(31, "Day must be between 1 and 31"),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

const recurringBillUpdateSchema = recurringBillCreateSchema.partial();

module.exports = { recurringBillCreateSchema, recurringBillUpdateSchema };