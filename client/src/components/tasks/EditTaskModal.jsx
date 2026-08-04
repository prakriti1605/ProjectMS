import { useEffect, useState } from "react";

export default function EditTaskModal({
  open,
  task,
  members,
  currMember,
  currentUser,
  onClose,
  onUpdate,
}) {

  // --- PERMISSION & STATE CHECKS ---
  const isDone = task?.status === "done";
  const isMember = currMember?.role === "member";
  const permissions = currMember?.permissions || [];

  // Safely verify if task is assigned to currently logged-in user
  const assignedId = typeof task?.assignedTo === "object" ? task?.assignedTo?._id : task?.assignedTo;
  const currentUserId = currentUser?._id;
  const isAssignedToMe = Boolean(assignedId && currentUserId && String(assignedId) === String(currentUserId));

  // Granular Field Permissions
  const canEditStatus = !isDone && (
    (!isMember && permissions.includes("task:updateStatus")) ||
    (isMember && isAssignedToMe && permissions.includes("task:updateStatus"))
  );

  const canEditDetails = !isDone && !isMember && permissions.includes("task:updateDetails");
  const canEditAssignee = !isDone && !isMember && permissions.includes("task:updateAssignee");
  const canEditDueDate = !isDone && !isMember && permissions.includes("task:updateDueDate");

  const canSubmit = canEditStatus || canEditDetails || canEditAssignee || canEditDueDate;

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    assignedTo: "",
    dueDate: "",
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        status: task.status || "todo",
        assignedTo: task.assignedTo?._id || "",
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : "",
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Build diff payload with only changed fields
    const updatedFields = {};

    if (canEditDetails && form.title !== (task.title || "")) {
      updatedFields.title = form.title;
    }
    if (canEditDetails && form.description !== (task.description || "")) {
      updatedFields.description = form.description;
    }
    if (canEditDetails && form.priority !== (task.priority || "medium")) {
      updatedFields.priority = form.priority;
    }
    if (canEditStatus && form.status !== (task.status || "todo")) {
      updatedFields.status = form.status;
    }
    if (canEditAssignee) {
      const originalAssignee = typeof task.assignedTo === "object" ? task.assignedTo?._id : task.assignedTo;
      if (form.assignedTo !== (originalAssignee || "")) {
        updatedFields.assignedTo = form.assignedTo;
      }
    }
    if (canEditDueDate) {
      const originalDueDate = task.dueDate ? task.dueDate.substring(0, 10) : "";
      if (form.dueDate !== originalDueDate) {
        updatedFields.dueDate = form.dueDate;
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      onClose(); // No changes made
      return;
    }

    onUpdate(updatedFields);
  };

  if (!open || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-[#181818] border border-gray-800 rounded-xl w-full max-w-xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-white font-semibold">Edit Task</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* --- PERMISSION BANNERS --- */}
        {isDone && (
          <div className="p-3 mb-4 text-sm text-amber-400 bg-amber-950/40 border border-amber-800/60 rounded-lg">
            Completed tasks cannot be updated.
          </div>
        )}
        {!isDone && !canSubmit && (
          <div className="p-3 mb-4 text-sm text-gray-400 bg-gray-900 border border-gray-800 rounded-lg">
            You do not have permission to edit this task.
          </div>
        )}

        <label className="text-gray-400 text-sm">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          disabled={!canEditDetails}
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <label className="text-gray-400 text-sm block mt-4">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          disabled={!canEditDetails}
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3 h-24 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-gray-400 text-sm">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              disabled={!canEditDetails}
              className="w-full mt-2 bg-[#222] text-white rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={!canEditStatus}
              className="w-full mt-2 bg-[#222] text-white rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <label className="text-gray-400 text-sm block mt-4">Assign Member</label>
        <select
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          disabled={!canEditAssignee}
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select Member</option>
          {members.map((member) => (
            <option
              key={member.user._id}
              value={member.user._id}
            >
              {member.user.username}
            </option>
          ))}
        </select>

        <label className="text-gray-400 text-sm block mt-4">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          disabled={!canEditDueDate}
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-700 text-gray-300 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              canSubmit
                ? "bg-orange-500 text-black hover:bg-orange-600"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}