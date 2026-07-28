import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orgApi } from "../api/org.api";
import { useOrganisation } from "../context/OrganisationContext";

export default function CreateOrganisation() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const {
    refreshOrganisations,
    selectOrganisation,
  } = useOrganisation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Organisation name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await orgApi.create(name.trim());

      const newOrganisation = response.data.org;

      const organisations = await refreshOrganisations();

      const createdOrganisation = organisations.find(
        (org) => org._id === newOrganisation._id
      );

      if (createdOrganisation) {
        selectOrganisation(createdOrganisation);
      }

      navigate("/projects");

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to create organisation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">

      <h1 className="text-2xl font-bold mb-2">
        Create Organisation
      </h1>

      <p className="text-muted-foreground mb-6">
        Create a new organisation and start managing your projects.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-5"
      >

        <div>
          <label className="block text-sm font-medium mb-2">
            Organisation Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter organisation name"
            className="w-full px-4 py-3 rounded-lg bg-secondary border border-border outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Organisation"}
        </button>

      </form>

    </div>
  );
}