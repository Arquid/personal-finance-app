import { describe, it, expect } from "vitest";

const { neutralizeFormula, restoreFormula, escapeCsvField, transactionsToCsv } = require("./csv");

describe("neutralizeFormula", () => {
  it("prefixes an apostrophe to text a spreadsheet would run as a formula", () => {
    for (const value of ['=HYPERLINK("http://evil.example","x")', "+SUM(1+1)", "-2+3", "@cmd", "\tcmd", "\rcmd"]) {
      expect(neutralizeFormula(value)).toBe(`'${value}`);
    }
  });

  it("leaves ordinary text alone", () => {
    for (const value of ["Coffee", "Rent - September", "a=b", "100% fun", "", "'quoted"]) {
      expect(neutralizeFormula(value)).toBe(value);
    }
  });
});

describe("restoreFormula", () => {
  it("undoes neutralizeFormula exactly", () => {
    for (const value of ["=1+1", "+1", "-1", "@x", "\tx", "plain", ""]) {
      expect(restoreFormula(neutralizeFormula(value))).toBe(value);
    }
  });

  it("leaves a leading apostrophe alone unless it guards a formula character", () => {
    expect(restoreFormula("'hello")).toBe("'hello");
  });
});

describe("escapeCsvField", () => {
  it("quotes fields containing commas, quotes or line breaks", () => {
    expect(escapeCsvField("a,b")).toBe('"a,b"');
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
    expect(escapeCsvField("line1\rline2")).toBe('"line1\rline2"');
  });

  it("neutralizes a formula before quoting it", () => {
    expect(escapeCsvField('=HYPERLINK("u","c")')).toBe(`"'=HYPERLINK(""u"",""c"")"`);
  });

  it("turns null and undefined into an empty field", () => {
    expect(escapeCsvField(null)).toBe("");
    expect(escapeCsvField(undefined)).toBe("");
  });
});

describe("transactionsToCsv", () => {
  it("writes a header and one row per transaction, defusing text columns but not the amount", () => {
    const csv = transactionsToCsv([
      {
        date: "2026-09-01T00:00:00.000Z",
        description: "=1+1",
        merchant: "+SUM(1)",
        amount: "-12.5",
        category: { name: "Groceries" },
      },
    ]);
    expect(csv.split("\n")).toEqual([
      "date,description,merchant,amount,category",
      "2026-09-01,'=1+1,'+SUM(1),-12.5,Groceries",
    ]);
  });
});
