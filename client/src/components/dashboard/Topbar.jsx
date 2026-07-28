import { Search, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useOrganisation } from "../../context/OrganisationContext";
export default function Topbar() {
  const { user } = useAuth();
  const {
  organisations,
  selectedOrganisation,
  selectOrganisation,
  } = useOrganisation();

  return (

      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
    {/* Organisation Selector */}
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        Organisation:
      </span>

      <select
        value={selectedOrganisation?._id || ""}
        onChange={(e) => {
          const organisation = organisations.find(
            (org) => org._id === e.target.value
          );

          if (organisation) {
            selectOrganisation(organisation);
          }
        }}
        className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
      >
        <option value="" disabled>
          Select Organisation
        </option>

        {organisations.map((organisation) => (
          <option
            key={organisation._id}
            value={organisation._id}
          >
            {organisation.name}
          </option>
        ))}
      </select>
    </div>

    {/* Right */}
    <div className="flex items-center gap-5">

      {/* Search */}
      {/* <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm w-32"
        />
      </div> */}

      {/* Notification */}
      <button>
        <Bell size={20} />
      </button>

      {/* User */}
      <div className="flex items-center gap-3">

        <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
          {user?.name?.charAt(0) || "U"}
        </div>

        <div className="hidden md:block">
          <p className="text-sm font-medium">
            {user?.name || user?.username}
          </p>

          <p className="text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>

      </div>

    </div>
      </header>
    );

    }