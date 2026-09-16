function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// A bill due on day 31 (e.g. "last day of the month") should still fire in a
// shorter month rather than silently never matching any date in it.
function effectiveDueDay(bill, year, month) {
  return Math.min(bill.dueDay, daysInMonth(year, month));
}

module.exports = { daysInMonth, effectiveDueDay };
