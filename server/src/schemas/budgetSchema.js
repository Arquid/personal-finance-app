const { z } = require("zod");
const { money } = require("./money");

const budgetCreateSchema = z.object({
  categoryId: z.coerce.number().int().positive("Category is required"),
  limitAmount: money().positive("Limit must be greater than 0"),
  period: z.enum(["monthly", "weekly", "yearly"]).optional(),
});

const budgetUpdateSchema = budgetCreateSchema.partial();

module.exports = { budgetCreateSchema, budgetUpdateSchema };
