import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BudgetFormModal from "./BudgetFormModal";

const categories = [
  { id: 10, name: "Groceries" },
  { id: 11, name: "Entertainment" },
];

describe("BudgetFormModal", () => {
  it("renders 'Add Budget' with a category select when there is no initial data", () => {
    render(
      <BudgetFormModal categories={categories} initialData={null} onSubmit={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("Add Budget")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toHaveValue("10");
  });

  it("shows the category as a disabled, non-editable field in edit mode", () => {
    const initialData = { categoryId: 11, category: "Entertainment", limitAmount: "100", period: "monthly" };
    render(
      <BudgetFormModal categories={categories} initialData={initialData} onSubmit={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText("Edit Budget")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Entertainment")).toBeDisabled();
  });

  it("shows a validation error when the limit amount is missing", async () => {
    const user = userEvent.setup();
    render(
      <BudgetFormModal categories={categories} initialData={null} onSubmit={() => {}} onClose={() => {}} />,
    );
    await user.click(screen.getByText("Add"));
    expect(await screen.findByText("Limit must be greater than 0")).toBeInTheDocument();
  });

  it("submits the form with the entered values, defaulting the period to monthly", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <BudgetFormModal categories={categories} initialData={null} onSubmit={onSubmit} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Limit Amount"), "250");
    await user.click(screen.getByText("Add"));
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toEqual({ categoryId: 10, limitAmount: 250, period: "monthly" });
  });

  it("submits the selected period when changed", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <BudgetFormModal categories={categories} initialData={null} onSubmit={onSubmit} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Limit Amount"), "250");
    await user.selectOptions(screen.getByLabelText("Period"), "yearly");
    await user.click(screen.getByText("Add"));
    expect(onSubmit.mock.calls[0][0].period).toBe("yearly");
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <BudgetFormModal categories={categories} initialData={null} onSubmit={() => {}} onClose={onClose} />,
    );
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});