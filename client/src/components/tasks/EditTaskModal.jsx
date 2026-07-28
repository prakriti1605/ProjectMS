
import { useEffect, useState } from "react";

export default function EditTaskModal({
  open,
  task,
  members,
  onClose,
  onUpdate,
}) {
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
    onUpdate(form);
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

        <label className="text-gray-400 text-sm">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3"
        />

        <label className="text-gray-400 text-sm block mt-4">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3 h-24"
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-gray-400 text-sm">Priority</label>
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
            <label className="text-gray-400 text-sm">Status</label>
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

        <label className="text-gray-400 text-sm block mt-4">Assign Member</label>
        <select
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3"
        >
          <option value="">Select Member</option>
          {members.map((member) => (
            <option
                key={member.user._id}
                value={member.user._id}
            >
                {member.user.name}
            </option>
          ))}
        </select>

        <label className="text-gray-400 text-sm block mt-4">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full mt-2 bg-[#222] text-white rounded-lg p-3"
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
            className="px-5 py-2 bg-orange-500 text-black rounded-lg font-medium"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}