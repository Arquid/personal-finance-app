const { z } = require("zod");

// Largest value that fits the Decimal(12,2) columns used for every money field.
const MAX_MONEY = 9_999_999_999.99;

// Money is stored with 2 decimals. Accepting more would let the database round
// the two halves of a transfer differently (0.005 debits nothing but credits
// 0.01), quietly creating money, so reject it at the boundary instead.
const money = () =>
  z.coerce
    .number()
    .multipleOf(0.01, "Amount can have at most 2 decimal places")
    .min(-MAX_MONEY, "Amount is too large")
    .max(MAX_MONEY, "Amount is too large");

// One shared instance: building a schema per call is wasteful when validating
// thousands of CSV rows.
const moneySchema = money();

function isValidMoney(value) {
  return moneySchema.safeParse(value).success;
}

module.exports = { money, isValidMoney, MAX_MONEY };
