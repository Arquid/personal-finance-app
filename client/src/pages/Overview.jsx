import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
} from "recharts";
import { getOverview, getSpendingByCategory, getBudgetVsActual, getMonthlyTrend } from "../api/client";
import useCurrency from "../hooks/useCurrency";
import "../stylesheets/Overview.css";

function formatMonthLabel(value) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function Overview() {
  const { formatCurrency } = useCurrency();
  const { data: overview, isLoading, isError } = useQuery({
    queryKey: ["overview"],
    queryFn: getOverview,
  });
  const { data: spending } = useQuery({
    queryKey: ["spending-by-category"],
    queryFn: getSpendingByCategory,
  });
  const { data: budgetVsActual } = useQuery({
    queryKey: ["budget-vs-actual"],
    queryFn: getBudgetVsActual,
  });
  const { data: trend } = useQuery({
    queryKey: ["monthly-trend"],
    queryFn: getMonthlyTrend,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError || !overview) return <p>Failed to load overview data.</p>;

  return (
    <div className="overview">
      <div className="summary-cards">
        <div className="card">
          <span className="card-label">Total Balance</span>
          <span className="card-value">{formatCurrency(overview.totalBalance)}</span>
        </div>
        <div className="card">
          <span className="card-label">Income (this month)</span>
          <span className="card-value income">{formatCurrency(overview.monthlyIncome)}</span>
        </div>
        <div className="card">
          <span className="card-label">Expenses (this month)</span>
          <span className="card-value expense">{formatCurrency(overview.monthlyExpenses)}</span>
        </div>
      </div>

      <div className="overview-grid">
        <section className="panel">
          <h3>Spending by Category</h3>
          {spending && spending.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={spending}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={100}
                >
                  {spending.map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No spending this month.</p>
          )}
        </section>

        <section className="panel">
          <h3>Budget vs. Actual</h3>
          {budgetVsActual && budgetVsActual.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={budgetVsActual} margin={{ bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="limitAmount" name="Budget" fill="#94a3b8" />
                <Bar dataKey="actual" name="Actual" fill="#6c5ce7" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No budgets set.</p>
          )}
        </section>
      </div>

      <div className="overview-grid">
        <section className="panel panel-wide">
          <h3>Monthly Trend</h3>
          {trend && trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={formatMonthLabel} />
                <YAxis />
                <Tooltip labelFormatter={formatMonthLabel} formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#16a34a" />
                <Bar dataKey="expenses" name="Expenses" fill="#dc2626" />
                <Line
                  type="monotone"
                  dataKey="runningExpenses"
                  name="Cumulative Expenses"
                  stroke="#6c5ce7"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <p>Not enough data yet.</p>
          )}
        </section>
        <section className="panel">
          <h3>Pots</h3>
          <ul className="pot-list">
            {overview.pots.map((pot) => {
              const percentage = Math.min(
                100,
                Math.round((Number(pot.currentAmount) / Number(pot.targetAmount)) * 100),
              );
              return (
                <li key={pot.id} className="pot-item">
                  <div className="pot-header">
                    <span>{pot.name}</span>
                    <span>
                      {formatCurrency(pot.currentAmount)} / {formatCurrency(pot.targetAmount)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%`, background: pot.color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="panel">
          <h3>Latest Transactions</h3>
          <ul className="transaction-list">
            {overview.latestTransactions.map((t) => (
              <li key={t.id} className="transaction-item">
                <div>
                  <span className="transaction-desc">{t.description}</span>
                  <span className="transaction-category">{t.category?.name ?? "Uncategorized"}</span>
                </div>
                <span
                  className={`transaction-amount ${Number(t.amount) < 0 ? "expense" : "income"}`}
                >
                  {formatCurrency(Number(t.amount))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Overview;