// src/pages/Members.jsx
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrganisation } from "../context/OrganisationContext";
import { useAuth } from "../context/AuthContext";
import { orgApi } from "../api/org.api";
import { queryKeys } from "../api/queryKeys";

const loadMembers = async (organisationId) => {
  const response = await orgApi.getMembers(organisationId);
  return response.data.members || [];
};

export default function Members() {
  // 1. Extract orgLoading from OrganisationContext
  const { selectedOrganisation, loading: orgLoading } = useOrganisation();
  const { hasPermission, activeMembership, loading: authLoading } = useAuth(); // 1. Auth loading status
  const queryClient = useQueryClient();
 
  const membersQuery = useQuery({
    queryKey: queryKeys.members(selectedOrganisation?._id),
    queryFn: () => loadMembers(selectedOrganisation._id),
    enabled: Boolean(selectedOrganisation?._id && !authLoading),
    staleTime: 45_000,
  });

  // Join Code States
  const [joinCode, setJoinCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync Join Code from selectedOrganisation
  useEffect(() => {
    if (selectedOrganisation) {
      setJoinCode(selectedOrganisation.joinCode || "");
      setExpiresAt(selectedOrganisation.joinCodeExpiresAt || null);
    }
  }, [selectedOrganisation]);

  const members = membersQuery.data || [];
  const loading = membersQuery.isPending;
  const error = membersQuery.isError
    ? membersQuery.error?.response?.status === 403
      ? "You do not have active access to view members of this organisation."
      : membersQuery.error?.response?.data?.message || "Failed to load members"
    : "";

  const refreshMembers = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.members(selectedOrganisation?._id),
    });

  const handleGenerateCode = async () => {
    try {
      setGeneratingCode(true);
      const res = await orgApi.generateJoinCode(selectedOrganisation._id);
      setJoinCode(res.data.joinCode);
      setExpiresAt(res.data.expiresAt);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate join code");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await orgApi.updateMemberRole(selectedOrganisation._id, userId, newRole);
      await refreshMembers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await orgApi.removeMember(selectedOrganisation._id, userId);
      await refreshMembers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  // 1. Wait for OrganisationContext to finish loading on initial direct navigation
  if (authLoading || orgLoading) {
    return <div className="p-6 text-center">Loading organisation...</div>;
  }

  // 2. Render warning if no organization is selected
  if (!selectedOrganisation) {
    return <div className="p-6 text-center">Please select an organisation first.</div>;
  }

  // 3. Render members loader
  if (loading) {
    return <div className="p-6 text-center">Loading members...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Organisation Members</h1>
          <p className="text-muted-foreground text-sm">
            Manage roles and access for {selectedOrganisation.name}
          </p>
        </div>
      </div>

      {/* JOIN CODE BANNER */}
      {(activeMembership?.role === "owner" || hasPermission("ORG_JOIN_CODE_MANAGE")) && (
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div>
            <h3 className="font-semibold text-sm">Invite Members with Join Code</h3>
            <p className="text-xs text-muted-foreground">
              {joinCode
                ? `Active Code: expires on ${new Date(expiresAt).toLocaleDateString()}`
                : "No active join code generated yet."}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {joinCode && (
              <div className="flex items-center bg-secondary border border-border px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-wider">
                {joinCode}
                <button
                  onClick={handleCopyCode}
                  className="ml-3 text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 rounded transition"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}

            <button
              onClick={handleGenerateCode}
              disabled={generatingCode}
              className="bg-primary text-primary-foreground px-3.5 py-1.5 text-xs rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {generatingCode
                ? "Generating..."
                : joinCode
                ? "Regenerate Code"
                : "Generate Code"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* MEMBERS TABLE */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 border-b border-border text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">Member</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              {(hasPermission("ORG_MEMBER_UPDATE") || hasPermission("ORG_MEMBER_REMOVE")) && (
                <th className="p-4 font-medium text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => (
              <tr key={m._id} className="hover:bg-secondary/30 transition">
                <td className="p-4 font-medium">
                  {m.user?.username || "Unknown"}
                  {m.user?._id === activeMembership?.user?._id && (
                    <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">
                  {m.user?.email || "N/A"}
                </td>
                <td className="p-4">
                  {hasPermission("ORG_MEMBER_UPDATE") && m.role !== "owner" ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.user?._id, e.target.value)}
                      className="bg-secondary border border-border rounded p-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className="capitalize font-medium text-xs px-2.5 py-1 rounded-full bg-secondary border border-border">
                      {m.role}
                    </span>
                  )}
                </td>

                {(hasPermission("ORG_MEMBER_UPDATE") || hasPermission("ORG_MEMBER_REMOVE")) && (
                  <td className="p-4 text-right space-x-2">
                    {hasPermission("ORG_MEMBER_REMOVE") && m.role !== "owner" && (
                      <button
                        onClick={() => handleRemoveMember(m.user?._id)}
                        className="text-red-500 hover:text-red-600 text-xs px-3 py-1.5 rounded border border-red-500/20 hover:bg-red-500/10 transition"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
