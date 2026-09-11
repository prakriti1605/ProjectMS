
import { useQuery } from "@tanstack/react-query";
import { orgApi } from "../api/org.api";
import { useNavigate } from "react-router-dom";
import OrgCard from "../components/OrgCard";
import { useOrganisation } from "../context/OrganisationContext";
import { useAuth } from "../context/AuthContext";
import { queryKeys } from "../api/queryKeys";

const loadOrganisations = async () => {
  const response = await orgApi.getAll();
  return response.data.organisations || [];
};

//ye bass org select karne ke liye hai
export default function Organisations() {
  const navigate = useNavigate();
  const { selectOrganisation } = useOrganisation();
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const organisationsQuery = useQuery({
    queryKey: queryKeys.organisations(userId),
    queryFn: loadOrganisations,
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
  const orgs = organisationsQuery.data || [];
  const loading = organisationsQuery.isPending;
  const error = organisationsQuery.isError
    ? organisationsQuery.error?.response?.data?.message || "Failed to load orgs"
    : "";

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
