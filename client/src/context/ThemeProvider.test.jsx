import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeProvider from "./ThemeProvider";
import useTheme from "../hooks/useTheme";
import { STORAGE_KEY } from "./themeContext";

function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to the system color scheme when nothing is stored", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("toggles between light and dark", async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    await user.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("persists the selected theme to localStorage", async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    await user.click(screen.getByText("Toggle"));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
  });

  it("restores the previously selected theme from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("sets the data-theme attribute on the document root", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("throws when useTheme is used outside a ThemeProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow("useTheme must be used within a ThemeProvider");
    consoleError.mockRestore();
  });
});