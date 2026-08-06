import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orgApi } from "../api/org.api";
import { projectApi } from "../api/project.api";
import ProjectCard from "../components/project/ProjectCard";
import { Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function OrganisationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Grab active session context from AuthContext
  const { setActiveMembership, hasPermission } = useAuth();

  const [org, setOrg] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState("");

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [orgRes, projectRes] = await Promise.all([
        orgApi.getById(id),
        projectApi.getByOrg(id),
      ]);

      // Handle backend response format from Phase 3
      setOrg(orgRes.data.org || orgRes.data.organisation || orgRes.data);
      setProjects(projectRes.data.projects || projectRes.data);

      // STEP 2: Save active member permissions in global AuthContext!
      if (orgRes.data.member) {
        setActiveMembership(orgRes.data.member);
      }

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const openCreateModal = () => {
    setProjectError("");
    setProjectForm({
      name: "",
      description: "",
    });
    setShowProjectModal(true);
  };

  const closeCreateModal = () => {
    if (creatingProject) return;
    setShowProjectModal(false);
    setProjectError("");
  };

  const handleCreateProject = async () => {
    setProjectError("");

    if (!projectForm.name.trim()) {
      setProjectError("Project name is required.");
      return;
    }

    try {
      setCreatingProject(true);

      await projectApi.create(id, {
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
      });

      setShowProjectModal(false);
      setProjectForm({
        name: "",
        description: "",
      });

      fetchData();
    } catch (err) {
      setProjectError(
        err.response?.data?.message || "Failed to create project."
      );
    } finally {
      setCreatingProject(false);
    }
  };

  // STEP 3: Instant Permission Checks using context
  const canManageOrganisation =
    hasPermission("ORG_UPDATE") || hasPermission("ORG_DELETE");

  const canCreateProject = hasPermission("PROJECT_CREATE");

  if (loading)
    return <div className="text-muted-foreground">Loading...</div>;

  if (error)
    return <div className="text-red-500">{error}</div>;

  if (!org) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{org.name}</h1>
          <p className="text-muted-foreground mt-2">
            {org.description || "Organisation View"}
          </p>
        </div>

        {/* Render Settings button ONLY if user has permission */}
        {canManageOrganisation && (
          <button
            onClick={() => navigate(`/org/${id}/settings`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        )}
      </div>

      {/* Projects */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold text-white">Projects</h2>

          {/* Render + New Project button ONLY if user has permission */}
          {canCreateProject && (
            <button
              onClick={openCreateModal}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90"
            >
              + New Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="text-muted-foreground">No projects yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} orgId={id} />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl w-[500px] p-6 shadow-xl">
            <h2 className="text-2xl font-semibold mb-5">Create New Project</h2>

            {projectError && (
              <div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 text-red-400 px-3 py-2 text-sm">
                {projectError}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Project Name"
                disabled={creatingProject}
                value={projectForm.name}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none"
              />

              <textarea
                rows={4}
                placeholder="Description (optional)"
                disabled={creatingProject}
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeCreateModal}
                disabled={creatingProject}
                className="px-5 py-2 rounded-lg border border-border disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateProject}
                disabled={creatingProject}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {creatingProject ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}