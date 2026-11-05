// A spreadsheet treats a cell that starts with one of these as a formula, so an
// exported description like =HYPERLINK("http://evil.example","click") would run
// when the file is opened (CSV/formula injection, OWASP).
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;
const ESCAPED_FORMULA = /^'[=+\-@\t\r]/;

// Defuses a text cell by prefixing an apostrophe, which spreadsheets read as
// "this is plain text". Only for text columns: the amount column is a number
// and its leading minus sign is legitimate.
function neutralizeFormula(value) {
  return FORMULA_TRIGGER.test(value) ? `'${value}` : value;
}

// Undoes neutralizeFormula on import, so a file that was exported and then
// imported again doesn't end up with stray apostrophes in front of values.
function restoreFormula(value) {
  return ESCAPED_FORMULA.test(value) ? value.slice(1) : value;
}

function escapeCsvField(value) {
  const str = neutralizeFormula(String(value ?? ""));
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function transactionsToCsv(transactions) {
  const header = "date,description,merchant,amount,category";
  const rows = transactions.map((t) =>
    [
      new Date(t.date).toISOString().slice(0, 10),
      escapeCsvField(t.description),
      escapeCsvField(t.merchant ?? ""),
      Number(t.amount),
      escapeCsvField(t.category?.name ?? ""),
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

module.exports = { neutralizeFormula, restoreFormula, escapeCsvField, transactionsToCsv };
