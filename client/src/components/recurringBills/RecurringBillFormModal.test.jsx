import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecurringBillFormModal from "./RecurringBillFormModal";

const categories = [
  { id: 10, name: "Bills" },
  { id: 11, name: "Entertainment" },
];

describe("RecurringBillFormModal", () => {
  it("renders 'Add Recurring Bill' with empty defaults", () => {
    render(
      <RecurringBillFormModal
        categories={categories}
        initialData={null}
        prefillData={null}
        onSubmit={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("Add Recurring Bill")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Active")).toBeChecked();
  });

  it("pre-fills fields from prefillData (from a detected recurring payment)", () => {
    const prefillData = { name: "Netflix", merchant: "Netflix", amount: 15.99, dueDay: 5, categoryId: 11 };
    render(
      <RecurringBillFormModal
        categories={categories}
        initialData={null}
        prefillData={prefillData}
        onSubmit={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByLabelText("Name")).toHaveValue("Netflix");
    expect(screen.getByLabelText("Due Day (1-31)")).toHaveValue(5);
  });

  it("pre-fills fields from initialData in edit mode", () => {
    const initialData = {
      name: "Rent",
      merchant: "Landlord Inc",
      amount: "950",
      dueDay: 1,
      categoryId: 10,
      isActive: false,
    };
    render(
      <RecurringBillFormModal
        categories={categories}
        initialData={initialData}
        prefillData={null}
        onSubmit={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("Edit Recurring Bill")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Rent");
    expect(screen.getByLabelText("Active")).not.toBeChecked();
  });

  it("shows a validation error when the due day is out of range", async () => {
    const user = userEvent.setup();
    render(
      <RecurringBillFormModal
        categories={categories}
        initialData={null}
        prefillData={null}
        onSubmit={() => {}}
        onClose={() => {}}
      />,
    );

    await user.type(screen.getByLabelText("Name"), "Gym");
    await user.type(screen.getByLabelText("Amount"), "30");
    await user.type(screen.getByLabelText("Due Day (1-31)"), "45");
    await user.click(screen.getByText("Add"));
    expect(await screen.findByText("Day must be between 1 and 31")).toBeInTheDocument();
  });

  it("submits the form, converting an empty category to null", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <RecurringBillFormModal
        categories={categories}
        initialData={null}
        prefillData={null}
        onSubmit={onSubmit}
        onClose={() => {}}
      />,
    );
    await user.type(screen.getByLabelText("Name"), "Gym");
    await user.type(screen.getByLabelText("Amount"), "30");
    await user.type(screen.getByLabelText("Due Day (1-31)"), "20");
    await user.click(screen.getByText("Add"));
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Gym",
      merchant: null,
      amount: 30,
      dueDay: 20,
      categoryId: null,
      isActive: true,
    });
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <RecurringBillFormModal
        categories={categories}
        initialData={null}
        prefillData={null}
        onSubmit={() => {}}
        onClose={onClose}
      />,
    );
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});