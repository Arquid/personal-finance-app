import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/layout/Sidebar";
import ErrorBoundary from "./components/layout/ErrorBoundary";

const Overview = lazy(() => import("./pages/Overview"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Pots = lazy(() => import("./pages/Pots"));
const RecurringBills = lazy(() => import("./pages/RecurringBills"));
const Accounts = lazy(() => import("./pages/Accounts"));

function App() {
  const location = useLocation();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<p>Loading...</p>}>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/pots" element={<Pots />} />
              <Route path="/recurring-bills" element={<RecurringBills />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;