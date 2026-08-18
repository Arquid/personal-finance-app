import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CurrencyProvider from "../context/CurrencyProvider";

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>{ui}</CurrencyProvider>
    </QueryClientProvider>,
  );
}

export default renderWithProviders;