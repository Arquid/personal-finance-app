import { describe, it, expect } from "vitest";

const { accountCreateSchema } = require("./accountSchema");
const { categoryCreateSchema } = require("./categorySchema");
const { potCreateSchema } = require("./potSchema");
const { recurringBillCreateSchema } = require("./recurringBillSchema");
const { transactionCreateSchema } = require("./transactionSchema");

// A name made only of spaces used to pass `.min(1)`, which produced blank
// options in the budget category list and an empty <h3> on the pot card.
const valid = {
  account: { name: "Main", type: "checking" },
  category: { name: "Food" },
  pot: { name: "Trip", targetAmount: 100 },
  bill: { name: "Rent", amount: 900, dueDay: 1 },
  transaction: { amount: -5, description: "Coffee", date: "2026-01-01", accountId: 1 },
};

const cases = [
  ["account name", accountCreateSchema, valid.account, "name"],
  ["category name", categoryCreateSchema, valid.category, "name"],
  ["pot name", potCreateSchema, valid.pot, "name"],
  ["recurring bill name", recurringBillCreateSchema, valid.bill, "name"],
  ["transaction description", transactionCreateSchema, valid.transaction, "description"],
];

describe.each(cases)("%s", (_label, schema, base, field) => {
  it("rejects a value made only of whitespace", () => {
    for (const blank of ["", " ", "     ", "\t\n"]) {
      expect(schema.safeParse({ ...base, [field]: blank }).success).toBe(false);
    }
  });

  it("stores the value without surrounding whitespace", () => {
    const result = schema.safeParse({ ...base, [field]: "  Padded value  " });
    expect(result.success).toBe(true);
    expect(result.data[field]).toBe("Padded value");
  });
});

describe("merchant", () => {
  it("is trimmed on transactions and recurring bills, so a stray space can't break merchant matching", () => {
    const tx = transactionCreateSchema.parse({ ...valid.transaction, merchant: " Netflix " });
    const bill = recurringBillCreateSchema.parse({ ...valid.bill, merchant: " Netflix " });
    expect(tx.merchant).toBe("Netflix");
    expect(bill.merchant).toBe("Netflix");
  });
});

describe("ids in request bodies", () => {
  it("rejects ids that don't fit an Int column", () => {
    expect(transactionCreateSchema.safeParse({ ...valid.transaction, accountId: 99999999999 }).success).toBe(false);
    expect(transactionCreateSchema.safeParse({ ...valid.transaction, categoryId: 99999999999 }).success).toBe(false);
  });

  it("still accepts a missing or null optional category", () => {
    expect(transactionCreateSchema.safeParse({ ...valid.transaction, categoryId: null }).success).toBe(true);
    expect(transactionCreateSchema.safeParse(valid.transaction).success).toBe(true);
  });
});
