
import { useEffect, useState } from "react";
import { orgApi } from "../api/org.api";
import { useNavigate } from "react-router-dom";
import OrgCard from "../components/OrgCard";
import { useOrganisation } from "../context/OrganisationContext";

//ye bass org select karne ke liye hai
export default function Organisations() {
  const navigate = useNavigate();
  const { selectOrganisation } = useOrganisation();
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl">
        {orgs.map((org) => (
          <OrgCard
            key={org._id}
            org={org}
            onClick={() => {
              selectOrganisation(org);
              navigate(`/org/${org._id}`);
            }}
          />
        ))}
                
      </div>
    </div>
  );
}