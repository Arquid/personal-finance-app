const { z } = require("zod");

const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  color: z.string().optional(),
});

module.exports = { categoryCreateSchema };