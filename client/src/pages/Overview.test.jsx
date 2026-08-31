import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import renderWithProviders from "../test/renderWithProviders";
import Overview from "./Overview";
import {
  getOverview,
  getSpendingByCategory,
  getBudgetVsActual,
  getMonthlyTrend,
  getUnusualSpending,
  getNetWorthHistory,
} from "../api/client";

vi.mock("../api/client", () => ({
  getOverview: vi.fn(),
  getSpendingByCategory: vi.fn(),
  getBudgetVsActual: vi.fn(),
  getMonthlyTrend: vi.fn(),
  getUnusualSpending: vi.fn(),
  getNetWorthHistory: vi.fn(),
}));

const overviewData = {
  totalBalance: 10230.35,
  monthlyIncome: 3450,
  monthlyExpenses: 1453.04,
  pots: [
    { id: 1, name: "Vacation", currentAmount: "750", targetAmount: "2000", color: "#0984e3" },
    { id: 2, name: "New Laptop", currentAmount: "1500", targetAmount: "1500", color: "#6c5ce7" },
  ],
  latestTransactions: [
    { id: 1, description: "Coffee", amount: "-5.80", category: { name: "Dining Out" } },
    { id: 2, description: "Monthly Salary", amount: "3200", category: null },
  ],
};

describe("Overview page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getOverview.mockResolvedValue(overviewData);
    getSpendingByCategory.mockResolvedValue([]);
    getBudgetVsActual.mockResolvedValue([]);
    getMonthlyTrend.mockResolvedValue([]);
    getUnusualSpending.mockResolvedValue([]);
    getNetWorthHistory.mockResolvedValue([]);
  });

  it("shows a loading state before the overview data arrives", () => {
    getOverview.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Overview />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error state when the overview request fails", async () => {
    getOverview.mockRejectedValue(new Error("network error"));
    renderWithProviders(<Overview />);
    expect(await screen.findByText("Failed to load overview data.")).toBeInTheDocument();
  });

  it("renders the summary cards with formatted totals", async () => {
    renderWithProviders(<Overview />);
    expect(await screen.findByText("$10,230.35")).toBeInTheDocument();
    expect(screen.getByText("$3,450.00")).toBeInTheDocument();
    expect(screen.getByText("$1,453.04")).toBeInTheDocument();
  });

  it("renders pots and latest transactions from the overview payload", async () => {
    renderWithProviders(<Overview />);
    expect(await screen.findByText("Vacation")).toBeInTheDocument();
    expect(screen.getByText("$750.00 / $2,000.00")).toBeInTheDocument();
    expect(screen.getByText("New Laptop")).toBeInTheDocument();

    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("Dining Out")).toBeInTheDocument();
    expect(screen.getByText("Monthly Salary")).toBeInTheDocument();
    expect(screen.getByText("Uncategorized")).toBeInTheDocument();
  });

  it("shows the unusual spending banner only when there is something to flag", async () => {
    getUnusualSpending.mockResolvedValue([
      { categoryId: 1, category: "Dining Out", currentTotal: 300, averageTotal: 100, percentageOfAverage: 300 },
    ]);
    renderWithProviders(<Overview />);
    expect(await screen.findByText("Unusual Spending Detected")).toBeInTheDocument();
    expect(screen.getByText(/300% of average/)).toBeInTheDocument();
  });

  it("hides the unusual spending banner when nothing is flagged", async () => {
    renderWithProviders(<Overview />);
    await screen.findByText("$10,230.35");
    expect(screen.queryByText("Unusual Spending Detected")).not.toBeInTheDocument();
  });

  it("shows empty-state messages when a chart has no data", async () => {
    renderWithProviders(<Overview />);
    await screen.findByText("$10,230.35");
    expect(screen.getByText("No spending this month.")).toBeInTheDocument();
    expect(screen.getByText("No budgets set.")).toBeInTheDocument();
    expect(screen.getAllByText("Not enough data yet.")).toHaveLength(2); // Net Worth History + Monthly Trend
  });

  it("renders chart sections instead of empty-state messages once data exists", async () => {
    getSpendingByCategory.mockResolvedValue([
      { categoryId: 1, category: "Groceries", color: "#0984e3", total: 120 },
    ]);
    getBudgetVsActual.mockResolvedValue([
      { categoryId: 1, category: "Groceries", color: "#0984e3", limitAmount: 400, actual: 120 },
    ]);
    getMonthlyTrend.mockResolvedValue([
      { month: "2026-07-01T00:00:00.000Z", income: 3200, expenses: 1200, runningExpenses: 1200 },
    ]);
    getNetWorthHistory.mockResolvedValue([{ date: "2026-08-01T00:00:00.000Z", totalBalance: 10000 }]);

    renderWithProviders(<Overview />);
    await screen.findByText("$10,230.35");

    expect(screen.queryByText("No spending this month.")).not.toBeInTheDocument();
    expect(screen.queryByText("No budgets set.")).not.toBeInTheDocument();
    expect(screen.queryByText("Not enough data yet.")).not.toBeInTheDocument();
  });
});
