export function getDaysUntilDue(dueDay, today = new Date()) {
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
  return Math.round((dueDate - todayDateOnly) / (1000 * 60 * 60 * 24));
}

export function getBillsNeedingReminder(bills, today = new Date()) {
  return bills.filter((bill) => {
    if (bill.status === "paid") return false;
    if (bill.status === "overdue") return true;
    const daysUntilDue = getDaysUntilDue(bill.dueDay, today);
    return daysUntilDue >= 0 && daysUntilDue <= 3;
  });
}