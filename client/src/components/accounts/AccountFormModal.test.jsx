import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountFormModal from "./AccountFormModal";

describe("AccountFormModal", () => {
  it("renders 'Add Account' with a checking type and a zero opening balance by default", () => {
    render(<AccountFormModal initialData={null} onSubmit={() => {}} onClose={() => {}} />);
    expect(screen.getByText("Add Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Type")).toHaveValue("checking");
    expect(screen.getByLabelText("Opening Balance")).toHaveValue(0);
  });

  it("pre-fills fields from initialData in edit mode", () => {
    const initialData = { name: "Savings Account", type: "savings", balance: "8100" };
    render(<AccountFormModal initialData={initialData} onSubmit={() => {}} onClose={() => {}} />);
    expect(screen.getByText("Edit Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Savings Account");
    expect(screen.getByLabelText("Type")).toHaveValue("savings");
    expect(screen.getByLabelText("Balance")).toHaveValue(8100);
  });

  it("shows a validation error when the name is empty", async () => {
    const user = userEvent.setup();
    render(<AccountFormModal initialData={null} onSubmit={() => {}} onClose={() => {}} />);
    await user.click(screen.getByText("Add"));
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
  });

  it("submits a brand new account with the default zero balance untouched", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AccountFormModal initialData={null} onSubmit={onSubmit} onClose={() => {}} />);
    await user.type(screen.getByLabelText("Name"), "New Checking");
    await user.click(screen.getByText("Add"));
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: "New Checking", type: "checking", balance: 0 });
  });

  it("submits the entered values including a chosen type and balance", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AccountFormModal initialData={null} onSubmit={onSubmit} onClose={() => {}} />);
    await user.type(screen.getByLabelText("Name"), "Rainy Day Fund");
    await user.selectOptions(screen.getByLabelText("Type"), "savings");
    await user.clear(screen.getByLabelText("Opening Balance"));
    await user.type(screen.getByLabelText("Opening Balance"), "500");
    await user.click(screen.getByText("Add"));
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: "Rainy Day Fund", type: "savings", balance: 500 });
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AccountFormModal initialData={null} onSubmit={() => {}} onClose={onClose} />);
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
