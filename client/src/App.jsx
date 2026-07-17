import { Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/layout/Sidebar";
import Overview from "./pages/Overview";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Pots from "./pages/Pots";
import RecurringBills from "./pages/RecurringBills";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/pots" element={<Pots />} />
          <Route path="/recurring-bills" element={<RecurringBills />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;