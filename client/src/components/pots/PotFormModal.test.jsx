import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PotFormModal from "./PotFormModal";

describe("PotFormModal", () => {
  it("renders 'Add Pot' with empty defaults when there is no initial data", () => {
    render(<PotFormModal initialData={null} onSubmit={() => {}} onClose={() => {}} />);
    expect(screen.getByText("Add Pot")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByRole("radio", { name: "#0984e3" })).toHaveAttribute("aria-checked", "true");
  });

  it("pre-fills fields from initialData in edit mode", () => {
    const initialData = { name: "Vacation", targetAmount: "2000", color: "#d63031" };
    render(<PotFormModal initialData={initialData} onSubmit={() => {}} onClose={() => {}} />);
    expect(screen.getByText("Edit Pot")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Vacation");
    expect(screen.getByLabelText("Target Amount")).toHaveValue(2000);
    expect(screen.getByRole("radio", { name: "#d63031" })).toHaveAttribute("aria-checked", "true");
  });

  it("shows a validation error when the name is empty", async () => {
    const user = userEvent.setup();
    render(<PotFormModal initialData={null} onSubmit={() => {}} onClose={() => {}} />);
    await user.type(screen.getByLabelText("Target Amount"), "500");
    await user.click(screen.getByText("Add"));
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
  });

  it("shows a validation error when the target amount is zero or negative", async () => {
    const user = userEvent.setup();
    render(<PotFormModal initialData={null} onSubmit={() => {}} onClose={() => {}} />);
    await user.type(screen.getByLabelText("Name"), "Vacation");
    await user.type(screen.getByLabelText("Target Amount"), "0");
    await user.click(screen.getByText("Add"));
    expect(await screen.findByText("Target amount must be greater than 0")).toBeInTheDocument();
  });

  it("selecting a color swatch updates which one is checked", async () => {
    const user = userEvent.setup();
    render(<PotFormModal initialData={null} onSubmit={() => {}} onClose={() => {}} />);
    await user.click(screen.getByRole("radio", { name: "#00b894" }));
    expect(screen.getByRole("radio", { name: "#00b894" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "#0984e3" })).toHaveAttribute("aria-checked", "false");
  });

  it("submits the form with the entered values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PotFormModal initialData={null} onSubmit={onSubmit} onClose={() => {}} />);
    await user.type(screen.getByLabelText("Name"), "New Laptop");
    await user.type(screen.getByLabelText("Target Amount"), "1500");
    await user.click(screen.getByRole("radio", { name: "#fdcb6e" }));
    await user.click(screen.getByText("Add"));
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: "New Laptop", targetAmount: 1500, color: "#fdcb6e" });
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PotFormModal initialData={null} onSubmit={() => {}} onClose={onClose} />);
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});