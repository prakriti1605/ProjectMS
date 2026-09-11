import { Bell, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useOrganisation } from "../../context/OrganisationContext";
import { getOrganisationActivities } from "../../api/activity.api.js";
import { queryKeys } from "../../api/queryKeys";

export default function Topbar() {
  const { user } = useAuth();

  const {
    organisations,
    selectedOrganisation,
    selectOrganisation,
  } = useOrganisation();

  const [activityOpen, setActivityOpen] = useState(false);
  const activitiesQuery = useQuery({
    queryKey: queryKeys.activity(selectedOrganisation?._id),
    queryFn: async () => {
      const response = await getOrganisationActivities(selectedOrganisation._id);
      return response.data || [];
    },
    enabled: activityOpen && Boolean(selectedOrganisation?._id),
    staleTime: 30_000,
  });
  const activities = activitiesQuery.data || [];

const formatActivityTime = (date) => {
  const now = new Date();
  const activityDate = new Date(date);

  const diffMs = now - activityDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  return activityDate.toLocaleDateString();
};

  return (
    <>
      <header className="h-14 shrink-0 border-b border-border bg-card flex items-center justify-between px-5">
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

          {/* Activity Bell */}
          <button
            onClick={() => setActivityOpen(true)}
            className="relative p-2 rounded-lg hover:bg-secondary transition"
          >
            <Bell size={20} />
          </button>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              {user?.username?.charAt(0) || "U"}
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-medium">
                {user?.username}
              </p>

              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Activity Drawer */}
      {activityOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setActivityOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed top-0 right-0 h-full w-[380px] bg-card border-l border-border z-50 shadow-xl flex flex-col">

            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-5">
              <h2 className="text-lg font-semibold">
                Activity
              </h2>

              <button
                onClick={() => setActivityOpen(false)}
                className="p-2 rounded-lg hover:bg-secondary transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Activities */}
              <div className="flex-1 overflow-y-auto px-5 py-4">

                {activities.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center">
                      No activity yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {activities.map((activity) => (
                      <div key={activity._id} className="flex gap-3">

                        {/* Activity Dot */}
                        <div className="mt-2 h-2.5 w-2.5 rounded-full bg-primary shrink-0" />

                        <div>
                          <p className="text-sm leading-5">{activity.message}</p>

                          <p className="text-xs text-muted-foreground mt-1">
                            {formatActivityTime(activity.createdAt)}
                          </p>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
          </aside>
        </>
      )}
    </>
  );
}
