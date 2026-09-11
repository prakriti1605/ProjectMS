import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { orgApi } from "../api/org.api";
import { queryKeys } from "../api/queryKeys";

export default function OrganisationSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const organisationQuery = useQuery({
    queryKey: queryKeys.organisation(id),
    queryFn: async () => {
      const response = await orgApi.getById(id);
      return response.data.organisation || response.data.org || response.data;
    },
    enabled: Boolean(id),
  });
  const org = organisationQuery.data;
  const loading = organisationQuery.isPending;

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Save states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!org) return;
    setName(org.name || "");
    setDescription(org.description || "");
  }, [org]);

  // Save organisation changes
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const payload = {
        name: name.trim() ? name.trim() : org?.name,
        description: description.trim(),
      };

      const response = await orgApi.updateorg(id, payload);
      const updatedOrg = response.data.organisation || response.data.org || response.data;

      queryClient.setQueryData(queryKeys.organisation(id), updatedOrg);
      setName(updatedOrg.name || "");
      setDescription(updatedOrg.description || "");

      setSuccess("Organisation updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update organisation."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${org?.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setDeleting(true);

      await orgApi.deleteorg(id);
      navigate("/org");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete organisation."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading settings...</div>;
  }

  if (!org) {
    return <div className="text-red-500">Organisation not found.</div>;
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(`/org/${id}`)}
          className="p-2 rounded-lg hover:bg-secondary transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-3xl font-semibold">Organisation Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage settings for {org.name}
          </p>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold">General</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your organisation information.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mt-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Organisation Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              placeholder="Describe your organisation..."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none resize-none focus:border-primary disabled:opacity-50"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-card border border-red-500/30 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Deleting an organisation is permanent and cannot be undone.
        </p>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="mt-5 px-5 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Organisation"}
        </button>
      </div>
    </div>
  );
}