export default function OrgCard({ org, onClick }) {

  const owner = org.members?.find(
    (member) => member.role === "owner"
  );


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
          {org.name}
        </h2>
      </div>


      {/* Content */}
      <div className="p-5">

        <p className="text-sm text-white">
          👤 Owner:{" "}
          {owner?.user?.username ||
           owner?.user?.email ||
           "Unknown"}
        </p>


        <p className="text-sm text-white mt-3">
          👥 {org.members?.length || 0} Members
        </p>


        <p className="text-sm text-white mt-3">
          📅 {new Date(org.createdAt).toLocaleDateString()}
        </p>


        <p className="text-sm text-primary mt-5 font-medium">
          → View Details
        </p>

      </div>

    </div>
  );
}