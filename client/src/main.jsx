import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeProvider from "./context/ThemeProvider.jsx";
import CurrencyProvider from "./context/CurrencyProvider.jsx";
import App from "./App.jsx";
import "./stylesheets/theme.css";
import "./index.css";
import "./stylesheets/Shared.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <CurrencyProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </StrictMode>,
);