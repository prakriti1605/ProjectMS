import { useEffect, useState } from "react";
import { orgApi } from "../api/org.api";
import { useNavigate } from "react-router-dom";

export default function Organisations() {
    const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrgs = async () => {
    try {
      const res = await orgApi.getAll();
      console.log("ORG RESPONSE:", res.data);

      setOrgs(res.data.organisations);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orgs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  if (loading) {
    return (
      <div className="text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-foreground mb-6">
        Organisations
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orgs.map((org) => (
          <div
            key={org._id}
            onClick={() => navigate(`/org/${org._id}`)}
            className="bg-card border border-border rounded-lg p-5 cursor-pointer
                        hover:border-primary transition"
            >
            {/* ORG NAME BADGE */}
            <div className="inline-block px-3 py-1 rounded-md 
                            bg-orange-400/20 border border-orange-400/30">
              <h2 className="text-white font-semibold text-sm">
                {org.name}
              </h2>
            </div>

            {/* Members */}
            <p className="text-sm text-muted-foreground mt-3">
              {org.members?.length || 0} members
            </p>

            {/* Meta */}
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>
                Created: {new Date(org.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}