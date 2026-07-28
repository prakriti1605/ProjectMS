import { useNavigate } from "react-router-dom";
export default function ProjectHeader({
  project,
  orgId,
  onSettings,
}) {
  const navigate = useNavigate();

  if (!project) return null;

  return (
    <div className="mb-6">

      <button
        onClick={() => navigate(`/org/${orgId}`)}
        className="
          mb-4
          px-4 py-2
          rounded-md
          border border-orange-400
          text-orange-400
          hover:bg-orange-400
          hover:text-black
          transition
          text-sm
          font-medium
        "
      >
        ← Back to Projects
      </button>

      <div
        className="
          bg-[#181818]
          rounded-xl
          border-l-4
          border-orange-400
          px-6
          py-5
        "
      >
        <div className="flex items-start justify-between gap-4">

          <div>
            <h1 className="text-2xl font-semibold text-white">
              {project.name}
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              {project.description || "No description"}
            </p>
          </div>

          <div className="flex items-center gap-3">

            {onSettings && (
              <button
                onClick={() => {
                  console.log("BUTTON CLICKED");
                  onSettings();
                }}
                className="
                  px-3 py-2
                  rounded-md
                  border border-gray-600
                  text-gray-300
                  hover:border-orange-400
                  hover:text-orange-400
                  transition
                  text-sm
                "
              >
                ⚙ Settings
              </button>
            )}

            <span
              className="
                px-3 py-1
                rounded-full
                text-xs
                font-medium
                bg-orange-400/20
                text-orange-400
                border border-orange-400/40
              "
            >
              Active
            </span>

          </div>

        </div>

        <div className="mt-4 text-sm text-gray-400">
          Created by:

          <span className="ml-1 text-gray-200 font-medium">
            {project.createdBy?.name || "Unknown"}
          </span>
        </div>

      </div>
    </div>
  );
}