import React, { useMemo } from "react";
import { SYSTEM_PERMISSIONS, PERMISSIONS } from "../../config/permission.config";

export const ViewPermissionsModal = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  const userPerms = useMemo(() => {
    if (
      member.role === "member" &&
      (!member.permissions || member.permissions.length === 0)
    ) {
      return [PERMISSIONS.TASK_UPDATE_STATUS];
    }
    return member.permissions || [];
  }, [member]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#18181b] border border-zinc-800 text-zinc-100 rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white">Permissions Overview</h2>
            <p className="text-xs text-zinc-400">
              Active permissions for {member.user?.username || member.user?.name || "User"} ({member.role})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {SYSTEM_PERMISSIONS.map((group) => {
            const activeGroupPerms = group.items.filter((item) =>
              userPerms.includes(item.key)
            );
            if (activeGroupPerms.length === 0) return null;

            return (
              <div key={group.category}>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeGroupPerms.map((perm) => (
                    <span
                      key={perm.key}
                      className="px-2.5 py-1 text-xs rounded-md bg-zinc-900 text-zinc-200 border border-zinc-800"
                    >
                      ✓ {perm.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-200 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};