import { NavLink } from "react-router-dom";
import useCurrency from "../../hooks/useCurrency";

const links = [
  { to: "/", label: "Overview" },
  { to: "/transactions", label: "Transactions" },
  { to: "/budgets", label: "Budgets" },
  { to: "/pots", label: "Pots" },
  { to: "/recurring-bills", label: "Recurring Bills" },
];

function Sidebar() {
  const { currency, setCurrency, currencies } = useCurrency();

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
    </nav>
  );
}

export default Sidebar;
