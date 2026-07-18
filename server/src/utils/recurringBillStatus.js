function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

function computeBillStatus(bill, paidMerchants) {
  if (bill.merchant && paidMerchants.has(bill.merchant.toLowerCase())) {
    return "paid";
  }

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDate = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);

  if (dueDate < todayDateOnly) return "overdue";
  return "due";
}

module.exports = { getCurrentMonthRange, computeBillStatus };