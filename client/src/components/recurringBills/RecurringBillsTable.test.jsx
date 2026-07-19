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
        />
      </table>,
    );
    expect(screen.getByText(/Due Day.*▲/)).toBeInTheDocument();
    expect(screen.queryByText(/Amount.*▲/)).not.toBeInTheDocument();
  });
});
