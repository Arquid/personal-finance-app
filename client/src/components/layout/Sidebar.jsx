import { NavLink } from "react-router-dom";
import useCurrency from "../../hooks/useCurrency";
import useTheme from "../../hooks/useTheme";

const links = [
  { to: "/", label: "Overview" },
  { to: "/accounts", label: "Accounts" },
  { to: "/transactions", label: "Transactions" },
  { to: "/budgets", label: "Budgets" },
  { to: "/pots", label: "Pots" },
  { to: "/recurring-bills", label: "Recurring Bills" },
];

function Sidebar() {
  const { currency, setCurrency, currencies } = useCurrency();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sidebar">
      <h1 className="sidebar-title">Finance</h1>
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} end={link.to === "/"}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-currency">
        <label htmlFor="currency-select">Currency</label>
        <select
          id="currency-select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {Object.entries(currencies).map(([code, { label }]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-theme">
        <label htmlFor="theme-toggle">Dark Mode</label>
        <button
          id="theme-toggle"
          type="button"
          role="switch"
          aria-checked={theme === "dark"}
          onClick={toggleTheme}
          className="theme-toggle"
        >
          <span className="theme-toggle-track">
            <span className="theme-toggle-thumb" />
          </span>
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;