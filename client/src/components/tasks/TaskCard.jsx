const priorityStyles = {
  high: {
    badge: "bg-red-500/10 text-red-400 border-red-500/30",
    border: "border-l-red-500",
  },
  medium: {
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    border: "border-l-yellow-500",
  },
  low: {
    badge: "bg-green-500/10 text-green-400 border-green-500/30",
    border: "border-l-green-500",
  },
};

const statusStyles = {
  todo: "bg-gray-500/10 text-gray-300 border-gray-500/30",
  "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  done: "bg-green-500/10 text-green-400 border-green-500/30",
};

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
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};
const formatDate = (date) => {
  if (!date) return "No Due Date";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
export default function TaskCard({ task, onSelect }) {
  const priority = priorityStyles[task.priority];

  return (
    <div
      onClick={() => onSelect(task)}
      className={`
        cursor-pointer
        bg-[#181818]
        rounded-xl
        border
        border-gray-800
        border-l-4
        ${priority?.border || "border-l-orange-400"}
        p-5
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-orange-400
        hover:shadow-lg
      `}
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-white truncate">
        {task.title}
      </h3>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-5">

        <span
          className={`
            px-3 py-1
            rounded-full
            text-xs
            font-medium
            border
            ${priority?.badge}
          `}
        >
          {formatPriority(task.priority)}
        </span>

        <span
          className={`
            px-3 py-1
            rounded-full
            text-xs
            font-medium
            border
            ${statusStyles[task.status]}
          `}
        >
          {formatStatus(task.status)}
        </span>

      </div>

      {/* Footer */}

      <div className="mt-5 pt-4 border-t border-gray-800 flex justify-between items-center">

          <div className="text-sm text-gray-300">
              👤 {task.assignedTo?.name || "Unassigned"}
          </div>

          <div className="text-sm text-gray-400">
              📅 {formatDate(task.dueDate)}
          </div>

      </div>
    </div>
  );
}