import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/layout/Sidebar";
import ErrorBoundary from "./components/layout/ErrorBoundary";
import Overview from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Pots from "./pages/Pots";
import RecurringBills from "./pages/RecurringBills";

function App() {
  const location = useLocation();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/pots" element={<Pots />} />
            <Route path="/recurring-bills" element={<RecurringBills />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;