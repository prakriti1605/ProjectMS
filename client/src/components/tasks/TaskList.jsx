import TaskCard from "./TaskCard";

export default function TaskList({
  tasks,
  onCreateTask,
  onSelectTask
}) {
  return (
    <div>
    
    <div className="flex items-center justify-between mb-6">

    <h2 className="text-2xl font-semibold text-white">
        Tasks
    </h2>

    <button
        onClick={onCreateTask}
        className="
        px-4
        py-2
        rounded-lg
        bg-orange-400
        text-black
        font-medium
        hover:bg-orange-400
        transition
        "
        >
        + New Task
    </button>
    </div>
      <div className="grid grid-cols-1      md:grid-cols-2 xl:grid-cols-3 gap-8">
        {tasks.map(task => (
        <TaskCard
            key={task._id}
            task={task}
            onSelect={onSelectTask}
        />
        ))}
      </div>
  </div>
  );
}