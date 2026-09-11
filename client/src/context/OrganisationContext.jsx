import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orgApi } from "../api/org.api";
import { queryKeys } from "../api/queryKeys";
import { useAuth } from "./AuthContext";

const OrganisationContext = createContext();
const EMPTY_LIST = [];

const fetchOrganisations = async () => {
  const response = await orgApi.getAll();
  return response.data.organisations || [];
};

const fetchOrganisation = async (organisationId) => {
  const response = await orgApi.getById(organisationId);
  return response.data;
};

export const OrganisationProvider = ({ children }) => {
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);
  const { user, loading: authLoading, setActiveMembership } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?._id || user?.id;
  const hasSession = Boolean(localStorage.getItem("token") && userId);

  const organisationsQuery = useQuery({
    queryKey: queryKeys.organisations(userId),
    queryFn: fetchOrganisations,
    enabled: !authLoading && hasSession,
    staleTime: 60_000,
  });

  const organisations = organisationsQuery.data ?? EMPTY_LIST;
  const visibleSelectedOrganisation =
    hasSession && organisations.some((organisation) => organisation._id === selectedOrganisation?._id)
      ? selectedOrganisation
      : null;

  const applyOrganisation = useCallback(
    async (organisation) => {
      if (!organisation?._id) return;

      setSelectedOrganisation(organisation);

      if (organisation.membership) {
        setActiveMembership(organisation.membership);
        return;
      }

      try {
        const organisationData = await queryClient.fetchQuery({
          queryKey: queryKeys.organisation(organisation._id),
          queryFn: () => fetchOrganisation(organisation._id),
          staleTime: 60_000,
        });

        if (organisationData.member) {
          setActiveMembership(organisationData.member);
        }
      } catch (error) {
        console.error("Failed to set active membership:", error);
      }
    },
    [queryClient, setActiveMembership]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!hasSession) return;

    if (!organisationsQuery.isSuccess) return;

    if (organisations.length === 0) return;

    const savedOrganisationId = localStorage.getItem("selectedOrgId");
    const organisation =
      organisations.find((item) => item._id === savedOrganisationId) ||
      organisations[0];

    const synchroniseSelectedOrganisation = async () => {
      localStorage.setItem("selectedOrgId", organisation._id);
      await applyOrganisation(organisation);
    };

    void synchroniseSelectedOrganisation();
  }, [
    applyOrganisation,
    authLoading,
    hasSession,
    organisations,
    organisationsQuery.isSuccess,
  ]);

  const refreshOrganisations = useCallback(async () => {
    if (!hasSession) return [];

    await queryClient.invalidateQueries({
      queryKey: queryKeys.organisations(userId),
    });

    return queryClient.fetchQuery({
      queryKey: queryKeys.organisations(userId),
      queryFn: fetchOrganisations,
      staleTime: 0,
    });
  }, [hasSession, queryClient, userId]);

  const selectOrganisation = useCallback(
    async (organisation) => {
      if (!organisation?._id) return;
      localStorage.setItem("selectedOrgId", organisation._id);
      await applyOrganisation(organisation);
    },
    [applyOrganisation]
  );

  return (
    <OrganisationContext.Provider
      value={{
        organisations,
        selectedOrganisation: visibleSelectedOrganisation,
        selectOrganisation,
        refreshOrganisations,
        loading: authLoading || (hasSession && organisationsQuery.isPending),
      }}
    >
      {children}
    </OrganisationContext.Provider>
  );
};

export const useOrganisation = () => useContext(OrganisationContext);
