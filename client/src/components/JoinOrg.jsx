import { useState } from "react";
import { orgApi } from "../api/org.api";
import { useOrganisation } from "../context/OrganisationContext";

export default function JoinOrg() {
    const {
  refreshOrganisations,
  selectOrganisation,
} = useOrganisation();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!joinCode.trim()) {
    setError("Please enter a join code");
    return;
  }

  try {
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await orgApi.joinOrganisation(
      joinCode.trim()
    );

    const joinedOrganisation =
      response.data.organisation;

    await refreshOrganisations();

    selectOrganisation(joinedOrganisation);

    setSuccess(response.data.message);
    setJoinCode("");

  } catch (error) {
    setError(
      error.response?.data?.message ||
      "Failed to join organisation"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Join Organisation
        </h1>

        <p className="text-muted-foreground mt-1">
          Enter the join code shared by an organisation owner
          or administrator.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-2">
            Organisation Join Code
          </label>

          <input
            type="text"
            value={joinCode}
            onChange={(e) =>
              setJoinCode(e.target.value.toUpperCase())
            }
            placeholder="TRK-XXXXXXXX"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 font-mono outline-none focus:border-primary"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-400">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !joinCode.trim()}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join Organisation"}
        </button>
      </form>

    </div>
  );
}