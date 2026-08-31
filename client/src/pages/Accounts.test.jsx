import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "../test/renderWithProviders";
import Accounts from "./Accounts";
import { getAccounts, createAccount, deleteAccount } from "../api/client";

vi.mock("../api/client", () => ({
  getAccounts: vi.fn(),
  createAccount: vi.fn(),
  updateAccount: vi.fn(),
  deleteAccount: vi.fn(),
}));

describe("Accounts page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty-state message when there are no accounts yet", async () => {
    getAccounts.mockResolvedValue([]);
    renderWithProviders(<Accounts />);
    expect(await screen.findByText("No accounts yet. Add one to get started.")).toBeInTheDocument();
  });

  it("renders a brand new account with a zero balance without crashing", async () => {
    getAccounts.mockResolvedValue([
      { id: 1, name: "New Checking", type: "checking", balance: "0" },
    ]);
    renderWithProviders(<Accounts />);
    expect(await screen.findByText("New Checking")).toBeInTheDocument();
    expect(screen.getByText("Checking")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    // A zero balance is not negative, so it should render with the "positive" styling.
    expect(screen.getByText("$0.00")).toHaveClass("positive");
  });

  it("renders a negative balance (e.g. a credit account) with the negative styling", async () => {
    getAccounts.mockResolvedValue([
      { id: 1, name: "Credit Card", type: "credit", balance: "-320.4" },
    ]);
    renderWithProviders(<Accounts />);
    expect(await screen.findByText("-$320.40")).toBeInTheDocument();
    expect(screen.getByText("-$320.40")).toHaveClass("negative");
  });

  it("creates a new account defaulting to a zero opening balance", async () => {
    const user = userEvent.setup();
    getAccounts.mockResolvedValue([]);
    createAccount.mockResolvedValue({});
    renderWithProviders(<Accounts />);
    await screen.findByText("No accounts yet. Add one to get started.");

    await user.click(screen.getByText("+ Add Account"));
    await user.type(screen.getByLabelText("Name"), "Starter Account");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(createAccount.mock.calls[0][0]).toEqual({
      name: "Starter Account",
      type: "checking",
      balance: 0,
    });
    expect(screen.queryByText("Add Account")).not.toBeInTheDocument();
  });

  it("warns that transactions will also be deleted, then deletes on confirmation", async () => {
    const user = userEvent.setup();
    getAccounts.mockResolvedValue([
      { id: 1, name: "Checking Account", type: "checking", balance: "0" },
    ]);
    deleteAccount.mockResolvedValue({});
    renderWithProviders(<Accounts />);
    await screen.findByText("Checking Account");

    await user.click(screen.getByText("Delete"));
    expect(
      screen.getByText('Delete "Checking Account"? This will also permanently delete all transactions on this account.'),
    ).toBeInTheDocument();

    const dialog = screen.getByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(deleteAccount.mock.calls[0][0]).toBe(1);
  });
});
