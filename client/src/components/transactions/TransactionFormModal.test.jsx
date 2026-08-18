import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "../../test/renderWithProviders";
import TransactionFormModal from "./TransactionFormModal";
import { suggestCategoryForMerchant, createCategory } from "../../api/client";

vi.mock("../../api/client", () => ({
  suggestCategoryForMerchant: vi.fn(),
  createCategory: vi.fn(),
}));

const accounts = [{ id: 1, name: "Checking" }];
const categories = [
  { id: 10, name: "Groceries" },
  { id: 11, name: "Entertainment" },
];

function Wrapper(props) {
  const { data: liveCategories } = useQuery({ queryKey: ["categories"], queryFn: () => categories });
  return <TransactionFormModal {...props} categories={liveCategories ?? []} />;
}

describe("TransactionFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    suggestCategoryForMerchant.mockResolvedValue(null);
  });

  it("renders 'Add Transaction' with default values when there is no initial data", () => {
    renderWithProviders(
      <TransactionFormModal accounts={accounts} categories={categories} initialData={null} onSubmit={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toHaveValue("expense");
  });

  it("pre-fills fields from initialData in edit mode", () => {
    const initialData = {
      amount: "-45.5",
      description: "Groceries run",
      merchant: "Corner Shop",
      date: "2026-03-01T00:00:00.000Z",
      accountId: 1,
      categoryId: 10,
    };
    renderWithProviders(
      <TransactionFormModal accounts={accounts} categories={categories} initialData={initialData} onSubmit={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toHaveValue("Groceries run");
    expect(screen.getByLabelText("Merchant (optional)")).toHaveValue("Corner Shop");
    expect(screen.getByLabelText("Amount")).toHaveValue(45.5);
  });

  it("shows a validation error when description is empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TransactionFormModal accounts={accounts} categories={categories} initialData={null} onSubmit={() => {}} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Amount"), "10");
    await user.click(screen.getByText("Add"));
    expect(await screen.findByText("Description is required")).toBeInTheDocument();
  });

  it("signs the amount negative for an expense and positive for income", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(
      <TransactionFormModal accounts={accounts} categories={categories} initialData={null} onSubmit={onSubmit} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Amount"), "25");
    await user.type(screen.getByLabelText("Description"), "Coffee");
    await user.click(screen.getByText("Add"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].amount).toBe(-25);

    onSubmit.mockClear();
    await user.selectOptions(screen.getByLabelText("Type"), "income");
    await user.click(screen.getByText("Add"));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].amount).toBe(25);
  });

  it("switches to the Add Category view and back without losing the transaction form", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TransactionFormModal accounts={accounts} categories={categories} initialData={null} onSubmit={() => {}} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Description"), "Netflix");
    await user.click(screen.getByText("+ New"));
    expect(screen.getByText("Add Category")).toBeInTheDocument();
    await user.click(screen.getByText("Back"));
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toHaveValue("Netflix");
  });

  it("creates a category and makes it available in the category list", async () => {
    createCategory.mockResolvedValue({ id: 99, name: "Subscriptions", color: "#6c5ce7" });
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <Wrapper accounts={accounts} initialData={null} onSubmit={() => {}} onClose={() => {}} />,
    );
    await user.click(screen.getByText("+ New"));
    await user.type(screen.getByLabelText("Name"), "Subscriptions");
    await user.click(screen.getByText("Add"));

    await waitFor(() => expect(screen.getByText("Add Transaction")).toBeInTheDocument());
    const select = container.querySelector('select[name="categoryId"]');
    expect(within(select).getByText("Subscriptions")).toBeInTheDocument();
  });

  it("shows the server error when creating a category fails", async () => {
    createCategory.mockRejectedValue({
      response: { data: { error: "A record with this name already exists." } },
    });
    const user = userEvent.setup();
    renderWithProviders(
      <TransactionFormModal accounts={accounts} categories={categories} initialData={null} onSubmit={() => {}} onClose={() => {}} />,
    );
    await user.click(screen.getByText("+ New"));
    await user.type(screen.getByLabelText("Name"), "Groceries");
    await user.click(screen.getByText("Add"));
    expect(await screen.findByText("A record with this name already exists.")).toBeInTheDocument();
  });

  it("shows a category suggestion after typing a merchant with history, and applies it", async () => {
    suggestCategoryForMerchant.mockResolvedValue({
      categoryId: 11,
      categoryName: "Entertainment",
      count: 3,
    });
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <TransactionFormModal accounts={accounts} categories={categories} initialData={null} onSubmit={() => {}} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Merchant (optional)"), "Netflix");

    expect(await screen.findByText(/Suggested:/)).toBeInTheDocument();
    await user.click(screen.getByText("Use"));

    expect(container.querySelector('select[name="categoryId"]')).toHaveValue("11");
    expect(screen.queryByText(/Suggested:/)).not.toBeInTheDocument();
  });

  it("does not fetch a suggestion once a category has already been chosen", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <TransactionFormModal accounts={accounts} categories={categories} initialData={null} onSubmit={() => {}} onClose={() => {}} />,
    );
    await user.selectOptions(container.querySelector('select[name="categoryId"]'), "10");
    await user.type(screen.getByLabelText("Merchant (optional)"), "Netflix");
    expect(suggestCategoryForMerchant).not.toHaveBeenCalled();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(
      <TransactionFormModal accounts={accounts} categories={categories} initialData={null} onSubmit={() => {}} onClose={onClose} />,
    );
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});