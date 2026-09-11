import { useNavigate } from "react-router-dom";
export default function ProjectCard({ project,orgId }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() =>
      navigate(`/projects/${orgId}/${project._id}`)
      }
      className="
        bg-card
        border
        border-border
        rounded-xl
        p-5
        hover:border-primary
        hover:-translate-y-1
        hover:shadow-lg
        transition-all
      "
    >

      <h3 className="text-lg font-semibold text-white">
        {project.name}
      </h3>


      <p className="text-sm text-white mt-3">
        {project.description || "No description"}
      </p>


      <div className="mt-4 inline-block px-3 py-1 rounded-full bg-orange-400/20 border border-orange-400/30">
        <span className="text-sm text-white">
          {project.status || "Not Started"}
        </span>
      </div>

    </div>
  );
}