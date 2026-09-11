import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOrganisation } from "../../context/OrganisationContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { selectedOrganisation } = useOrganisation();

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-border flex flex-col">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-border">
        <h1 className="text-xl font-bold text-primary">
          ProjectMS
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Project Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">

        <NavLink to="/dashboard" className={navClass}>
          Dashboard
        </NavLink>

        <NavLink to="/organisations" className={navClass}>
          Organisations
        </NavLink>

        <NavLink to="/projects" className={navClass}>
          Projects
        </NavLink>
        {selectedOrganisation && (
          <NavLink
            to="/members"
            className={navClass}
          >
            Members
          </NavLink>
        )}
      </nav>

      <div className="pt-3 mt-3 px-3 border-t border-border space-y-1">
        <NavLink
          to="/create-organisation"
          className={navClass}
        >
          Create Organisation
        </NavLink>

        <NavLink
          to="/join-organisation"
          className={navClass}
        >
          Join Organisation
        </NavLink>
      </div>

      {/* User */}
      <div className="border-t border-border p-4">

        <div className="mb-3">
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