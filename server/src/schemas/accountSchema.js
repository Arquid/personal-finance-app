const z = require("zod");

const accountCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["checking", "savings", "credit"], {
    error: "Type must be checking, savings or credit",
  }),
  balance: z.coerce.number().optional(),
});

const accountUpdateSchema = accountCreateSchema.partial();

module.exports = { accountCreateSchema, accountUpdateSchema };
