import { createContext, useContext, useEffect, useState } from "react";
import { orgApi } from "../api/org.api";
import { useAuth } from "./AuthContext";

const OrganisationContext = createContext();

export const OrganisationProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [organisations, setOrganisations] = useState([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setOrganisations([]);
      setSelectedOrganisation(null);
      setLoading(false);
      return;
    }

    const fetchOrganisations = async () => {
      try {
        setLoading(true);

        const response = await orgApi.getAll();

        const orgs =
          response.data.organisations ||
          response.data;

        setOrganisations(orgs);

        const savedOrgId =
          localStorage.getItem("selected_org_id");

        if (savedOrgId) {
          const savedOrg = orgs.find(
            (org) => org._id === savedOrgId
          );

          if (savedOrg) {
            setSelectedOrganisation(savedOrg);
          }
        }

      } catch (error) {
        console.error(
          "Failed to fetch organisations:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisations();

  }, [user, authLoading]);

  const selectOrganisation = (organisation) => {
  const latestOrganisation =
    organisations.find(
      (org) => org._id === organisation._id
    );

  setSelectedOrganisation(
    latestOrganisation || organisation
  );

  localStorage.setItem(
    "selected_org_id",
    organisation._id
  );
};

  const clearOrganisation = () => {
    setSelectedOrganisation(null);
    localStorage.removeItem("selected_org_id");
  };
  const refreshOrganisations = async () => {
  try {
    const response = await orgApi.getAll();

    const orgs =
      response.data.organisations ||
      response.data;

    setOrganisations(orgs);

    const selectedOrgId =
      localStorage.getItem("selected_org_id");

    if (selectedOrgId) {
      const updatedSelectedOrg =
        orgs.find(
          (org) => org._id === selectedOrgId
        );

      if (updatedSelectedOrg) {
        setSelectedOrganisation(
          updatedSelectedOrg
        );
      }
    }

    return orgs;

  } catch (error) {
    console.error(
      "Failed to refresh organisations:",
      error
    );
  }
};

  return (
    <OrganisationContext.Provider
      value={{
        organisations,
        selectedOrganisation,
        selectOrganisation,
        clearOrganisation,
        refreshOrganisations,
        loading
      }}>
      {children}
    </OrganisationContext.Provider>
  );
};

export const useOrganisation = () => {
  return useContext(OrganisationContext);
};