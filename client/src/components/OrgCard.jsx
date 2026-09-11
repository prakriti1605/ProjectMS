export default function OrgCard({ org, onClick }) {
  // 1. Resolve Owner Name (supports new normalized backend payload & legacy org.members fallback)
  const legacyOwner = org?.members?.find((m) => m.role === "owner");
  const ownerName =
    org?.ownerName ||
    legacyOwner?.user?.username ||
    legacyOwner?.user?.email ||
    "Unknown";

  // 2. Resolve Member Count (supports aggregated org.memberCount & legacy org.members.length fallback)
  const memberCount = org?.memberCount ?? org?.members?.length ?? 0;

  return (
    <div
      onClick={onClick}
      className="
        bg-card
        border
        border-border
        rounded-xl
        overflow-hidden
        cursor-pointer
        transition-all
        hover:border-primary
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* Orange Header */}
      <div
        className="
          bg-orange-400/20
          border-b
          border-orange-400/30
          px-5
          py-4
        "
      >
        <h2 className="font-semibold text-white text-lg">
          {org?.name}
        </h2>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-sm text-white">
          👤 Owner: {ownerName}
        </p>

        <p className="text-sm text-white mt-3">
          👥 {memberCount} {memberCount === 1 ? "Member" : "Members"}
        </p>

        <p className="text-sm text-white mt-3">
          📅 {org?.createdAt ? new Date(org.createdAt).toLocaleDateString() : "N/A"}
        </p>

        <p className="text-sm text-primary mt-5 font-medium">
          → View Details
        </p>
      </div>
    </div>
  );
}