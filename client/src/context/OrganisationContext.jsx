// src/context/OrganisationContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { orgApi } from "../api/org.api";
import { useAuth } from "./AuthContext";

const OrganisationContext = createContext();

export const OrganisationProvider = ({ children }) => {
  const [organisations, setOrganisations] = useState([]);
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth Context se authLoading aur user dono destructure karein
  const { user, loading: authLoading, setActiveMembership } = useAuth();


// this function gets the list of all org that logged in user belongs to. 
//it calls getMyOrgs controller which in turn chechks orgmemeber collection and then return the matched userid and orgids
  const refreshOrganisations = async () => {
    const token = localStorage.getItem("token");
    if (!token || !user) return [];

    try {
      const res = await orgApi.getAll();
      const orgList = res.data.organisations || [];
      setOrganisations(orgList);
      return orgList;
    } catch (err) {
      console.error("Failed to load organisations:", err);
      return [];
    }
  };
// ab once we have all the org list, we seelct one org. And this fn handles that. Ki abhi user kaun si org ko select karke kaam kar raha hai. 
  const selectOrganisation = async (org) => {
    if (!org?._id) return;
    setSelectedOrganisation(org);

    try {
      // Single Org Details & Member status load karke Auth Context sync karein
      const response = await orgApi.getById(org._id);
      if (response.data.member) {
        setActiveMembership(response.data.member);// once we have fetched org, we set membership status of the user. 
      }
    } catch (err) {
      console.error("Failed to set active membership:", err);
    }
  };

  useEffect(() => {
    const initOrgs = async () => {
      // 1. Agar Auth hi load ho raha hai, toh hold karein
      if (authLoading) return;

      const token = localStorage.getItem("token");
      if (token && user) {
        setLoading(true);
        const orgs = await refreshOrganisations();
        
        // 2. Clear previous or set default organisation
        if (orgs.length > 0) {
          // Check if user previously selected an org 
          const savedOrgId = localStorage.getItem("selectedOrgId");
          //if selected org exists in array reselect it otherwise set first org as selected org. 
          const found = orgs.find((o) => o._id === savedOrgId) || orgs[0];
          
          await selectOrganisation(found);
          localStorage.setItem("selectedOrgId", found._id);
        } else {
          setSelectedOrganisation(null);
        }
        setLoading(false);
      } else {
        setOrganisations([]);
        setSelectedOrganisation(null);
        setLoading(false);
      }
    };

    initOrgs();
  }, [authLoading, user]); // Auth load complete hone par hi run hoga

  // Select switch wrapper to persist in localStorage
  const handleSelectOrganisation = async (org) => {
    if (org?._id) {
      localStorage.setItem("selectedOrgId", org._id);
      await selectOrganisation(org);
    }
  };

  return (
    <OrganisationContext.Provider
      value={{
        organisations,
        selectedOrganisation,
        selectOrganisation: handleSelectOrganisation,
        refreshOrganisations,
        loading: loading || authLoading, // Express Global Context Loading state
      }}
    >
      {children}
    </OrganisationContext.Provider>
  );
};

export const useOrganisation = () => useContext(OrganisationContext);