import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "../../test/renderWithProviders";
import RecurringBillsTable from "./RecurringBillsTable";

const bills = [
  {
    id: 1,
    name: "Netflix",
    merchant: "Netflix",
    category: { name: "Entertainment" },
    dueDay: 5,
    amount: "15.99",
    status: "paid",
  },
  {
    id: 2,
    name: "Electricity",
    merchant: "City Power & Light",
    category: { name: "Bills" },
    dueDay: 12,
    amount: "75.50",
    status: "overdue",
  },
  {
    id: 3,
    name: "Gym Membership",
    merchant: null,
    category: null,
    dueDay: 20,
    amount: "34.00",
    status: "due",
  },
];

describe("RecurringBillsTable", () => {
  it("renders a status badge with the correct label for each status", () => {
    renderWithProviders(
      <table>
        <RecurringBillsTable
          bills={bills}
          sortBy="dueDay"
          order="asc"
          onSort={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onMarkPaid={() => {}}
        />
      </table>,
    );
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("Due")).toBeInTheDocument();
  });

  it("falls back to 'Uncategorized' when a bill has no category", () => {
    renderWithProviders(
      <table>
        <RecurringBillsTable
          bills={bills}
          sortBy="dueDay"
          order="asc"
          onSort={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onMarkPaid={() => {}}
        />
      </table>,
    );
    expect(screen.getByText("Uncategorized")).toBeInTheDocument();
  });

  it("calls onSort with the field name when a sortable header is clicked", async () => {
    const onSort = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <table>
        <RecurringBillsTable
          bills={bills}
          sortBy="dueDay"
          order="asc"
          onSort={onSort}
          onEdit={() => {}}
          onDelete={() => {}}
          onMarkPaid={() => {}}
        />
      </table>,
    );
    await user.click(screen.getByText("Amount"));
    expect(onSort).toHaveBeenCalledWith("amount");
  });

  it("shows the sort direction arrow only on the active column", () => {
    renderWithProviders(
      <table>
        <RecurringBillsTable
          bills={bills}
          sortBy="dueDay"
          order="asc"
          onSort={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onMarkPaid={() => {}}
        />
      </table>,
    );
    expect(screen.getByText(/Due Day.*▲/)).toBeInTheDocument();
    expect(screen.queryByText(/Amount.*▲/)).not.toBeInTheDocument();
  });

  it("shows an enabled 'Mark as Paid' button for an unpaid bill with a merchant", () => {
    renderWithProviders(
      <table>
        <RecurringBillsTable
          bills={bills}
          sortBy="dueDay"
          order="asc"
          onSort={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onMarkPaid={() => {}}
        />
      </table>,
    );
    expect(screen.getByRole("button", { name: "Mark Electricity as paid" })).toBeEnabled();
  });

  it("disables 'Mark as Paid' for a bill with no merchant", () => {
    renderWithProviders(
      <table>
        <RecurringBillsTable
          bills={bills}
          sortBy="dueDay"
          order="asc"
          onSort={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onMarkPaid={() => {}}
        />
      </table>,
    );
    const buttons = screen.getAllByText("Mark as Paid");
    const disabledButton = buttons.find((b) => b.hasAttribute("disabled"));
    expect(disabledButton).toBeDisabled();
  });

  it("does not show 'Mark as Paid' for an already-paid bill", () => {
    renderWithProviders(
      <table>
        <RecurringBillsTable
          bills={bills}
          sortBy="dueDay"
          order="asc"
          onSort={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onMarkPaid={() => {}}
        />
      </table>,
    );
    expect(screen.queryByRole("button", { name: "Mark Netflix as paid" })).not.toBeInTheDocument();
  });

  it("calls onMarkPaid with the bill when the button is clicked", async () => {
    const onMarkPaid = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <table>
        <RecurringBillsTable
          bills={bills}
          sortBy="dueDay"
          order="asc"
          onSort={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          onMarkPaid={onMarkPaid}
        />
      </table>,
    );
    await user.click(screen.getByRole("button", { name: "Mark Electricity as paid" }));
    expect(onMarkPaid).toHaveBeenCalledWith(bills[1]);
  });
});