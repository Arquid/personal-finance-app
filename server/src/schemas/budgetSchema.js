const { z } = require("zod");

const budgetCreateSchema = z.object({
  categoryId: z.coerce.number().int().positive("Category is required"),
  limitAmount: z.coerce.number().positive("Limit must be greater than 0"),
  period: z.enum(["monthly", "weekly", "yearly"]).optional(),
});

const budgetUpdateSchema = budgetCreateSchema.partial();

module.exports = { budgetCreateSchema, budgetUpdateSchema };
