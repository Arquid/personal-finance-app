import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BudgetCard from "./BudgetCard";

const baseBudget = {
  category: "Groceries",
  color: "#0984e3",
  actual: 130.98,
  limitAmount: 400,
  status: "ok",
  latestTransactions: [],
};

describe("BudgetCard", () => {
  it("renders the category name and formatted amounts", () => {
    render(<BudgetCard budget={baseBudget} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("$130.98")).toBeInTheDocument();
  });

  it("shows no warning text when status is 'ok'", () => {
    render(<BudgetCard budget={baseBudget} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.queryByText(/gone over/)).not.toBeInTheDocument();
    expect(screen.queryByText(/close to/)).not.toBeInTheDocument();
  });

  it("shows the over-budget message when status is 'over'", () => {
    render(
      <BudgetCard budget={{ ...baseBudget, status: "over" }} onEdit={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByText("You've gone over this budget's limit.")).toBeInTheDocument();
  });

  it("shows the warning message when status is 'warning'", () => {
    render(
      <BudgetCard
        budget={{ ...baseBudget, status: "warning" }}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(screen.getByText("You're close to your budget limit.")).toBeInTheDocument();
  });

  it("renders the latest transactions list when present", () => {
    const budget = {
      ...baseBudget,
      latestTransactions: [{ id: 1, description: "Grocery run", amount: -45.2 }],
    };
    render(<BudgetCard budget={budget} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("Grocery run")).toBeInTheDocument();
    expect(screen.getByText("-$45.20")).toBeInTheDocument();
  });

  it("does not render the latest transactions section when empty", () => {
    render(<BudgetCard budget={baseBudget} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.queryByText("Latest Transactions")).not.toBeInTheDocument();
  });
});
