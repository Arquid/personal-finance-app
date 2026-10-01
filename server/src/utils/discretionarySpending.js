// Total of "everyday" spending in a set of transactions: expenses that are not
// recurring bills. Recurring bills are projected separately, on their due day,
// so counting them here as well would charge each one twice.
//
// A transaction counts as a recurring bill payment when it is flagged
// isRecurring, or when its merchant matches the merchant of any RecurringBill
// (active or not — a cancelled subscription's old payments won't repeat, so
// they shouldn't inflate the average either). The merchant match is what makes
// this work for payments entered through the UI or a CSV import, which never
// set isRecurring.
function sumDiscretionarySpending(transactions, bills) {
  const recurringMerchants = new Set(
    bills.filter((b) => b.merchant).map((b) => b.merchant.trim().toLowerCase()),
  );

  let total = 0;
  for (const t of transactions) {
    const amount = Number(t.amount);
    if (!(amount < 0) || t.isRecurring) continue;
    if (t.merchant && recurringMerchants.has(t.merchant.trim().toLowerCase())) continue;
    total += -amount;
  }
  return total;
}

module.exports = { sumDiscretionarySpending };
