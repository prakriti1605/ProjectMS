import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { orgApi } from "../api/org.api";
import { projectApi } from "../api/project.api";

export default function OrganisationDetails() {
  const { id } = useParams();

  const [org, setOrg] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [orgRes, projectRes] = await Promise.all([
        orgApi.getById(id),
        projectApi.getByOrg(id),
      ]);

      setOrg(orgRes.data.organisation || orgRes.data);
      console.log("PROJECT RESPONSE:", projectRes.data);
      setProjects(projectRes.data.projects || projectRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div className="text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!org) return null;

  return (
    <div>
      {/* HEADER */}
      <h1 className="text-3xl font-semibold">{org.name}</h1>
      <p className="text-muted-foreground mt-2">
        {org.members?.length || 0} members
      </p>

      {/* PROJECTS */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Projects</h2>

        {projects.length === 0 ? (
          <div className="text-muted-foreground">
            No projects yet
          </div>
        ) : (
          <div className="grid gap-3">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-card border border-border p-4 rounded-lg"
              >
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {project.description || "No description"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}