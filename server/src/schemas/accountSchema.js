const z = require("zod");

const accountCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["checking", "savings", "credit"], {
    error: "Type must be checking, savings or credit",
  }),
  balance: z.coerce.number().optional(),
});

const accountUpdateSchema = accountCreateSchema.partial();

const accountTransferSchema = z
  .object({
    fromAccountId: z.coerce.number().int().positive("Source account is required"),
    toAccountId: z.coerce.number().int().positive("Destination account is required"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Cannot transfer to the same account",
    path: ["toAccountId"],
  });

module.exports = { accountCreateSchema, accountUpdateSchema, accountTransferSchema };