import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImportCsvModal from "./ImportCsvModal";

const accounts = [
  { id: 1, name: "Checking" },
  { id: 2, name: "Savings" },
];

function makeFile(name = "transactions.csv") {
  return new File(["date,description,amount\n2026-01-01,Coffee,-5"], name, { type: "text/csv" });
}

describe("ImportCsvModal", () => {
  it("disables the Import button until a file is selected", () => {
    render(
      <ImportCsvModal accounts={accounts} onImport={() => {}} onClose={() => {}} isImporting={false} result={null} error={null} />,
    );
    expect(screen.getByText("Import")).toBeDisabled();
  });

  it("enables the Import button once a file is chosen", async () => {
    const user = userEvent.setup();
    render(
      <ImportCsvModal accounts={accounts} onImport={() => {}} onClose={() => {}} isImporting={false} result={null} error={null} />,
    );
    await user.upload(screen.getByLabelText("CSV file"), makeFile());
    expect(screen.getByText("Import")).toBeEnabled();
  });

  it("calls onImport with a FormData containing the file and account on submit", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();
    render(
      <ImportCsvModal accounts={accounts} onImport={onImport} onClose={() => {}} isImporting={false} result={null} error={null} />,
    );
    await user.selectOptions(screen.getByLabelText("Account"), "2");
    await user.upload(screen.getByLabelText("CSV file"), makeFile());
    await user.click(screen.getByText("Import"));

    expect(onImport).toHaveBeenCalledOnce();
    const formData = onImport.mock.calls[0][0];
    expect(formData.get("accountId")).toBe("2");
    expect(formData.get("file").name).toBe("transactions.csv");
  });

  it("shows 'Importing...' and disables the button while isImporting is true", () => {
    render(
      <ImportCsvModal accounts={accounts} onImport={() => {}} onClose={() => {}} isImporting={true} result={null} error={null} />,
    );
    expect(screen.getByText("Importing...")).toBeDisabled();
  });

  it("shows the row-level errors from a partially successful import", () => {
    const result = {
      imported: 2,
      totalRows: 3,
      skipped: 1,
      errors: [{ row: 4, error: "Amount must be a non-zero number" }],
    };
    render(
      <ImportCsvModal accounts={accounts} onImport={() => {}} onClose={() => {}} isImporting={false} result={result} error={null} />,
    );
    expect(screen.getByText("Imported 2 of 3 rows (1 skipped).")).toBeInTheDocument();
    expect(screen.getByText("Row 4: Amount must be a non-zero number")).toBeInTheDocument();
  });

  it("shows a generic error message when the whole import fails", () => {
    render(
      <ImportCsvModal
        accounts={accounts}
        onImport={() => {}}
        onClose={() => {}}
        isImporting={false}
        result={null}
        error="Only CSV files are allowed"
      />,
    );
    expect(screen.getByText("Only CSV files are allowed")).toBeInTheDocument();
  });

  it("calls onClose when Close is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ImportCsvModal accounts={accounts} onImport={() => {}} onClose={onClose} isImporting={false} result={null} error={null} />,
    );
    await user.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});