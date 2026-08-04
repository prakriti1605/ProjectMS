import React, { useState, useEffect, useMemo } from "react";
import { SYSTEM_PERMISSIONS, PERMISSIONS } from "../../config/permission.config";
import { orgApi } from "../../api/org.api";

export const ManagePermissionsModal = ({
  isOpen,
  onClose,
  member,
  orgId,
  onPermissionsUpdated,
}) => {
  if (!isOpen || !member) return null;

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (member) {
      if (member.role === "member") {
        const memberPerms =
          member.permissions && member.permissions.length > 0
            ? member.permissions
            : [PERMISSIONS.TASK_UPDATE_STATUS];
        setSelectedPermissions(memberPerms);
      } else {
        setSelectedPermissions(member.permissions || []);
      }
    }
  }, [member]);

  const availablePermissions = useMemo(() => {
    if (member.role === "member") {
      return [
        {
          category: "Tasks",
          items: [
            {
              key: PERMISSIONS.TASK_UPDATE_STATUS,
              label: "Update Task Status",
              description: "Allows changing task status columns",
            },
          ],
        },
      ];
    }

    if (member.role === "admin") {
      return SYSTEM_PERMISSIONS.filter(
        (group) => group.category === "Projects" || group.category === "Tasks"
      );
    }

    return SYSTEM_PERMISSIONS;
  }, [member]);

  const handleToggle = (permissionKey) => {
    if (selectedPermissions.includes(permissionKey)) {
      setSelectedPermissions(
        selectedPermissions.filter((p) => p !== permissionKey)
      );
    } else {
      setSelectedPermissions([...selectedPermissions, permissionKey]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      const targetUserId = member.user?._id || member.user;
      await orgApi.updateMemberPermissions(
        orgId,
        targetUserId,
        selectedPermissions
      );
      if (onPermissionsUpdated) onPermissionsUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#18181b] border border-zinc-800 text-zinc-100 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Manage Permissions</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Editing permissions for{" "}
              <span className="text-orange-500 font-semibold">
                {member.user?.username || member.user?.name || "User"}
              </span>{" "}
              ({member.role})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {availablePermissions.map((group) => (
            <div key={group.category} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-1">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      onClick={() => handleToggle(perm.key)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-orange-500/10 border-orange-500/40 text-white"
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 accent-orange-500 rounded cursor-pointer"
                      />
                      <div>
                        <div className="text-sm font-medium text-zinc-200">
                          {perm.label}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {perm.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 text-sm bg-orange-500 hover:bg-orange-600 font-medium text-white rounded-lg transition-colors cursor-pointer"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};