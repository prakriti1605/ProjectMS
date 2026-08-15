import { useEffect, useState } from "react";
import { useOrganisation } from "../context/OrganisationContext";
import { useAuth } from "../context/AuthContext";
import { projectApi } from "../api/project.api";
import ProjectCard from "../components/project/ProjectCard";
import CreateProjectModal from "../components/project/ProjectModals/CreateProjectModal";

export default function Projects() {
  const {
    selectedOrganisation,
    loading: organisationLoading,
  } = useOrganisation();

  const { user,hasPermission } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] =
    useState(false);

  // Find the current user's membership in the selected organisation
  const currentMember =
  selectedOrganisation?.members?.find(
    (member) =>
      member.user?.email === user?.email
  );

const canCreateProject = hasPermission("project:create");

  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedOrganisation?._id) {
        setProjects([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await projectApi.getByOrg(
          selectedOrganisation._id
        );

        setProjects(
          response.data.projects || response.data
        );
      } catch (error) {
        console.error(
          "Failed to fetch projects:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load projects"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedOrganisation?._id]);

  const handleCreateProject = async (data) => {
    try {
      await projectApi.create(
        selectedOrganisation._id,
        data
      );

      setShowCreateModal(false);

      const response = await projectApi.getByOrg(
        selectedOrganisation._id
      );

      setProjects(
        response.data.projects || response.data
      );
    } catch (error) {
      console.error(
        "Failed to create project:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create project"
      );

      throw error;
    }
  };

  if (organisationLoading) {
    return (
      <div className="p-10 text-muted-foreground">
        Loading organisation...
      </div>
    );
  }

  if (!selectedOrganisation) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold text-foreground">
          Projects
        </h1>

        <p className="mt-3 text-muted-foreground">
          Please select an organisation from the topbar
          first.
        </p>
      </div>
    );
  }

  return (
    <div className="p-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Projects
          </h1>

          <p className="mt-2 text-muted-foreground">
            Projects in {selectedOrganisation.name}
          </p>
        </div>

        {/* Only users with project:create can see this */}
        {canCreateProject && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground px-5 py-3 rounded-lg hover:opacity-90 transition"
          >
            + New Project
          </button>
        )}

      </div>

      {/* Loading */}
      {loading && (
        <p className="text-muted-foreground">
          Loading projects...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        projects.length === 0 && (
          <div className="border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">
              No projects found in this organisation.
            </p>
          </div>
        )}

      {/* Projects */}
      {!loading &&
        !error &&
        projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                orgId={selectedOrganisation._id}
              />
            ))}

          </div>
        )}

      {/* Create Project Modal */}
      {canCreateProject && (
        <CreateProjectModal
          open={showCreateModal}
          onClose={() =>
            setShowCreateModal(false)
          }
          onCreate={handleCreateProject}
        />
      )}

    </div>
  );
}