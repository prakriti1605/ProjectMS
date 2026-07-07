import { Search, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">

      {/* Left */}
      <div>
        <h2 className="font-semibold text-lg">
          Dashboard
        </h2>
      </div>


      {/* Right */}
      <div className="flex items-center gap-5">

        {/* Search */}
        <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-32"
          />
        </div>


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