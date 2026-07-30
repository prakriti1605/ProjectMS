const formatStatus = (status) => {
  switch (status) {
    case "todo":
      return "Todo";
    case "in-progress":
      return "In Progress";
    case "done":
      return "Done";
    default:
      return status;
  }
};

const formatPriority = (priority) => {
  if (!priority) return "-";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

const formatDate = (date) => {
  if (!date) return "Not Set";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const priorityColor = {
  high: "bg-red-500/10 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/10 text-green-400 border-green-500/30",
};

const statusColor = {
  todo: "bg-gray-500/10 text-gray-300 border-gray-500/30",
  "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  done: "bg-green-500/10 text-green-400 border-green-500/30",
};

export default function TaskDetailsModal({
  open,
  task,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!open || !task) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

      <div className="w-full max-w-2xl rounded-xl bg-[#181818] border border-gray-800 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">

          <div>

            <p className="text-sm text-orange-400 font-medium">
              Task Details
            </p>

            <h2 className="text-2xl font-semibold text-white mt-1">
              {task.title}
            </h2>

          </div>

          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-white"
          >
            ✕
          </button>

        </div>

        {/* Priority + Status */}
        <div className="px-6 py-5 flex gap-3">

          <span
            className={`px-3 py-1 rounded-full text-sm border ${priorityColor[task.priority]}`}
          >
            {formatPriority(task.priority)}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-sm border ${statusColor[task.status]}`}
          >
            {formatStatus(task.status)}
          </span>

        </div>

        {/* Description */}
        <div className="px-6">

          <div className="rounded-lg bg-[#202020] border border-gray-800 p-4">

            <p className="text-sm text-gray-400 mb-2">
              Description
            </p>

            <p className="text-gray-200 leading-7">
              {task.description || "No description available."}
            </p>

          </div>

        </div>

        {/* Information */}
        <div className="px-6 py-6">

          <div className="space-y-4">

            <InfoRow
              label="Project"
              value={task.project?.name}
            />

            <InfoRow
              label="Assigned To"
              value={task.assignedTo?.username || "Unassigned"}
            />

            <InfoRow
              label="Created By"
              value={task.createdBy?.username}
            />

            <InfoRow
              label="Due Date"
              value={formatDate(task.dueDate)}
            />

            <InfoRow
              label="Created At"
              value={formatDate(task.createdAt)}
            />

            <InfoRow
              label="Updated At"
              value={formatDate(task.updatedAt)}
            />

          </div>

        </div>

        {/* Footer */}

        <div className="border-t border-gray-800 px-6 py-4 flex justify-end gap-3">

          <button
            onClick={()=>onEdit(task)}
            className="px-5 py-2 rounded-lg bg-orange-500 text-black font-medium hover:bg-orange-400 transition"
          >
            Edit
          </button>

          <button
            onClick={()=> onDelete(task)}
            className="px-5 py-2 rounded-lg border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-800 pb-3">

      <span className="text-gray-400">
        {label}
      </span>

      <span className="text-white font-medium">
        {value || "-"}
      </span>

    </div>
  );
}