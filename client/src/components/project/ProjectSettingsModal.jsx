import { useEffect, useState } from "react";

export default function ProjectSettingsModal({
open,
project,
onClose,
onUpdate,
onDelete,
}) {
const [name, setName] = useState("");
const [description, setDescription] = useState("");
const [saving, setSaving] = useState(false);
const [deleting, setDeleting] = useState(false);
const [error, setError] = useState("");
const [showDeleteConfirmation, setShowDeleteConfirmation] =
useState(false);

useEffect(() => {
if (project && open) {
setName(project.name || "");
setDescription(project.description || "");
setError("");
setShowDeleteConfirmation(false);
}
}, [project, open]);

if (!open || !project) {
return null;
}

const handleSubmit = async (e) => {
e.preventDefault();

if (!name.trim()) {
  setError("Project name is required");
  return;
}

try {
  setSaving(true);
  setError("");

  await onUpdate({
    name: name.trim(),
    description: description.trim(),
  });
} catch (err) {
  setError(
    err.response?.data?.message ||
      "Failed to update project"
  );
} finally {
  setSaving(false);
}
};

const handleDelete = async () => {
try {
setDeleting(true);
setError("");
  await onDelete();
} catch (err) {
  setError(
    err.response?.data?.message ||
      "Failed to delete project"
  );
  setDeleting(false);
}
}

return (
<div
className="
fixed inset-0 z-50
flex items-center justify-center
bg-black/70 px-4
"
onMouseDown={(e) => {
if (e.target === e.currentTarget) {
onClose();
}
}}
> <div
     className="
       w-full max-w-lg max-h-[90vh]
       overflow-y-auto
       rounded-xl
       border border-gray-700
       bg-[#181818]
       p-6
       shadow-2xl
     "
   >
{/* Header */} <div className="flex items-center justify-between"> <div> <h2 className="text-xl font-semibold text-white">
Project Settings </h2>

```
        <p className="mt-1 text-sm text-gray-400">
          Update your project information
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="
          text-xl text-gray-400
          transition hover:text-white
        "
      >
        ✕
      </button>
    </div>

    {/* Error */}
    {error && (
      <div
        className="
          mt-5 rounded-md
          border border-red-500/30
          bg-red-500/10
          px-4 py-3
          text-sm text-red-400
        "
      >
        {error}
      </div>
    )}

    {/* General Settings */}
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-5"
    >
      {/* Project Name */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Project Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full rounded-md
            border border-gray-700
            bg-[#101010]
            px-4 py-3
            text-white
            outline-none
            transition
            focus:border-orange-400
          "
          placeholder="Enter project name"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Description
        </label>

        <textarea
          rows={4}
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="
            w-full resize-none rounded-md
            border border-gray-700
            bg-[#101010]
            px-4 py-3
            text-white
            outline-none
            transition
            focus:border-orange-400
          "
          placeholder="Enter project description"
        />
      </div>

      {/* Actions */}
      <div
        className="
          flex justify-end gap-3
          border-b border-gray-700
          pb-6
        "
      >
        <button
          type="button"
          onClick={onClose}
          className="
            rounded-md
            border border-gray-700
            px-4 py-2
            text-sm text-gray-300
            transition
            hover:border-gray-500
            hover:text-white
          "
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="
            rounded-md
            bg-orange-400
            px-4 py-2
            text-sm font-medium text-black
            transition
            hover:bg-orange-300
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>

    {/* Danger Zone */}
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-red-400">
        Danger Zone
      </h3>

      <p className="mt-2 text-sm text-gray-400">
        Deleting this project is permanent. This action
        cannot be undone.
      </p>

      {!showDeleteConfirmation ? (
        <button
          type="button"
          onClick={() =>
            setShowDeleteConfirmation(true)
          }
          className="
            mt-4 rounded-md
            border border-red-500/50
            px-4 py-2
            text-sm text-red-400
            transition
            hover:bg-red-500/10
          "
        >
          Delete Project
        </button>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-red-400">
            Are you sure? This action cannot be undone.
          </p>

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() =>
                setShowDeleteConfirmation(false)
              }
              className="
                rounded-md
                border border-gray-700
                px-4 py-2
                text-sm text-gray-300
                hover:text-white
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="
                rounded-md
                bg-red-600
                px-4 py-2
                text-sm font-medium text-white
                transition
                hover:bg-red-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {deleting
                ? "Deleting..."
                : "Yes, Delete Project"}
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>


);
}
