const z = require("zod");
const { idField } = require("./ids");
const { money } = require("./money");

const accountCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  type: z.enum(["checking", "savings", "credit"], {
    error: "Type must be checking, savings or credit",
  }),
  balance: money().optional(),
});

const accountUpdateSchema = accountCreateSchema.partial();

const accountTransferSchema = z
  .object({
    fromAccountId: idField("Source account is required"),
    toAccountId: idField("Destination account is required"),
    amount: money().positive("Amount must be greater than 0"),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Cannot transfer to the same account",
    path: ["toAccountId"],
  });

module.exports = { accountCreateSchema, accountUpdateSchema, accountTransferSchema };