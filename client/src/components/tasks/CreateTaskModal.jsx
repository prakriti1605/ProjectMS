import { useState } from "react";

export default function CreateTaskModal({
  open,
  members,
  onClose,
  onCreate,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    assignedTo: "",
    dueDate: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }

    setError("");

    onCreate({
      ...form,
      assignedTo: form.assignedTo || undefined,
      dueDate: form.dueDate || undefined,
    });
  };

  const handleClose = () => {
    setForm({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      assignedTo: "",
      dueDate: "",
    });

    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <form
        onSubmit={handleSubmit}
        className="bg-[#181818] border border-gray-800 rounded-xl w-full max-w-xl p-6"
      >

        {/* Header */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl text-white font-semibold">
            Create Task
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>

        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-red-400 text-sm">
            {error}
          </p>
        )}

        {/* Title */}
        <label className="text-gray-400 text-sm">
          Title
        </label>

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter task title"
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3 outline-none"
        />

        {/* Description */}
        <label className="text-gray-400 text-sm block mt-4">
          Description
        </label>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter task description"
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3 h-24 outline-none"
        />

        {/* Priority + Status */}
        <div className="grid grid-cols-2 gap-4 mt-4">

          <div>
            <label className="text-gray-400 text-sm">
              Priority
            </label>

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full mt-2 bg-[#222] text-white rounded-lg p-3"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm">
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full mt-2 bg-[#222] text-white rounded-lg p-3"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

        </div>

        {/* Assign Member */}
        <label className="text-gray-400 text-sm block mt-4">
          Assign Member
        </label>

        <select
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3"
        >
          <option value="">
            Select Member
          </option>

          {members.map((member) => (
            <option
              key={member.user._id}
              value={member.user._id}
            >
              {member.user.username}
            </option>
          ))}
        </select>

        {/* Due Date */}
        <label className="text-gray-400 text-sm block mt-4">
          Due Date
        </label>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">

          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 border border-gray-700 text-gray-300 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-orange-500 text-black rounded-lg font-medium"
          >
            Create Task
          </button>

        </div>

      </form>

    </div>
  );
}