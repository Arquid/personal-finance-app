import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Overview" },
  { to: "/transactions", label: "Transactions" },
  { to: "/budgets", label: "Budgets" },
  { to: "/pots", label: "Pots" },
  { to: "/recurring-bills", label: "Recurring Bills" },
];

function Sidebar() {
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
    </nav>
  );
}

export default Sidebar;