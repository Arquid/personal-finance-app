import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "../test/renderWithProviders";
import Budgets from "./Budgets";
import {
  getBudgets,
  getBudgetVsActual,
  getLatestByCategory,
  getCategories,
  createBudget,
  deleteBudget,
} from "../api/client";

vi.mock("../api/client", () => ({
  getBudgets: vi.fn(),
  getBudgetVsActual: vi.fn(),
  getLatestByCategory: vi.fn(),
  getCategories: vi.fn(),
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
}));

const categories = [
  { id: 1, name: "Groceries", color: "#0984e3" },
  { id: 2, name: "Entertainment", color: "#d63031" },
];

const budgets = [
  {
    id: 1,
    categoryId: 1,
    category: { name: "Groceries", color: "#0984e3" },
    limitAmount: "300",
    period: "monthly",
  },
];

const budgetVsActual = [{ categoryId: 1, actual: 350, percentage: 116, status: "over" }];

const latestByCategory = [
  {
    categoryId: 1,
    transactions: [{ id: 10, description: "Whole Foods", amount: "-45.00" }],
  },
];

describe("Budgets page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBudgets.mockResolvedValue(budgets);
    getBudgetVsActual.mockResolvedValue(budgetVsActual);
    getLatestByCategory.mockResolvedValue(latestByCategory);
    getCategories.mockResolvedValue(categories);
  });

  it("merges budgets with their actual spending, status, and latest transactions", async () => {
    renderWithProviders(<Budgets />);
    expect(await screen.findByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("$350.00")).toBeInTheDocument();
    expect(screen.getByText("of $300.00")).toBeInTheDocument();
    expect(screen.getByText("You've gone over this budget's limit.")).toBeInTheDocument();
    expect(screen.getByText("Whole Foods")).toBeInTheDocument();
  });

  it("only offers categories without an existing budget when adding a new one", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Budgets />);
    await screen.findByText("Groceries");
    await user.click(screen.getByText("+ Add Budget"));
    expect(screen.getByText("Add Budget")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Groceries" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Entertainment" })).toBeInTheDocument();
  });

  it("creates a budget through the form and refetches the list", async () => {
    const user = userEvent.setup();
    createBudget.mockResolvedValue({});
    renderWithProviders(<Budgets />);
    await screen.findByText("Groceries");
    await user.click(screen.getByText("+ Add Budget"));
    await user.type(screen.getByLabelText("Limit Amount"), "100");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(createBudget.mock.calls[0][0]).toEqual({
      categoryId: 2,
      limitAmount: 100,
      period: "monthly",
    });
    expect(screen.queryByText("Add Budget")).not.toBeInTheDocument();
  });

  it("deletes a budget after confirming", async () => {
    const user = userEvent.setup();
    deleteBudget.mockResolvedValue({});
    renderWithProviders(<Budgets />);
    await screen.findByText("Groceries");
    await user.click(screen.getByText("Delete"));
    expect(screen.getByText('Delete the "Groceries" budget?')).toBeInTheDocument();

    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(deleteBudget.mock.calls[0][0]).toBe(1);
  });
});