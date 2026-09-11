import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orgApi } from "../api/org.api";
import { projectApi } from "../api/project.api";
import ProjectCard from "../components/project/ProjectCard";
import { Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useOrganisation } from "../context/OrganisationContext";
export default function OrganisationDetails() {
  const { id } = useParams(); //read orgId from url
  const navigate = useNavigate();

  // what is th role of user logged in. Is he member, admin or owner, and what are his permissions.
  const { setActiveMembership, hasPermission } = useAuth();
  const { selectedOrganisation } = useOrganisation();
  
  const effectiveOrgId = selectedOrganisation?._id || id;

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
    if (!effectiveOrgId) return;

    try {
      setLoading(true);

      const [orgRes, projectRes] = await Promise.all([
        orgApi.getById(effectiveOrgId),
        projectApi.getByOrg(effectiveOrgId),
      ]);

      setOrg(orgRes.data.org || orgRes.data.organisation || orgRes.data);
      setProjects(projectRes.data.projects || projectRes.data);

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

  // 5️⃣ Listen to effectiveOrgId so it refetches automatically on Topbar switch
  useEffect(() => {
    fetchData();
  }, [effectiveOrgId]);

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
      {/* Projects Section */}
<div className="mt-8">
  <h2 className="text-xl font-bold text-white mb-4">Projects</h2>

  {projects.length === 0 ? (
    <div className="text-muted-foreground text-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
      No projects found in this organisation.
    </div>
  ) : (
    /* 🎯 Changed gap-8 and 2-col to match the 3-column layout of Projects page */
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project) => (
        <ProjectCard 
          key={project._id} 
          project={{
            ...project,
            // Ensure title fallback if API returns name vs title
            name: project.name || project.title || "Untitled Project",
            description: project.description || "",
          }} 
          orgId={id} 
        />
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