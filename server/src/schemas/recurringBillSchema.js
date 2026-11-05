const { z } = require("zod");
const { idField } = require("./ids");
const { money } = require("./money");

const recurringBillCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  merchant: z.string().trim().max(255).optional().nullable(),
  amount: money().positive("Amount must be greater than 0"),
  dueDay: z.coerce.number().int().min(1, "Day must be between 1 and 31").max(31, "Day must be between 1 and 31"),
  categoryId: idField("Category is invalid").optional().nullable(),
  isActive: z.boolean().optional(),
});

const recurringBillUpdateSchema = recurringBillCreateSchema.partial();

module.exports = { recurringBillCreateSchema, recurringBillUpdateSchema };