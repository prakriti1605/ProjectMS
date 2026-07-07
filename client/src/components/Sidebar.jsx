import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col">

      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">
          ProjectMS
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Project Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">

        <NavLink to="/dashboard" className={navClass}>
          Dashboard
        </NavLink>

        <NavLink to="/organisations" className={navClass}>
          Organisations
        </NavLink>

      </nav>

      {/* User */}
      <div className="border-t border-border p-5">

        <div className="mb-4">
          <p className="font-medium text-foreground">
            {user?.name || user?.username}
          </p>

          <p className="text-sm text-muted-foreground">
            {user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition"
        >
          Logout
        </button>

      </div>

    </aside>
  );
}