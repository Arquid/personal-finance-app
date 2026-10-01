const { z } = require("zod");
const { money } = require("./money");

const potCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  targetAmount: money().positive("Target amount must be greater than 0"),
  color: z.string().optional(),
});

const potUpdateSchema = potCreateSchema.partial();

const potAmountSchema = z.object({
  amount: money().positive("Amount must be positive"),
});

module.exports = { potCreateSchema, potUpdateSchema, potAmountSchema };
