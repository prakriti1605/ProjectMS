import React from 'react';
import { AlertTriangle, Clock, UserX, ShieldAlert } from 'lucide-react';

export default function ProjectRiskBanner({ tasks = [], phases = [] }) {
  const today = new Date().toISOString().split('T')[0];

  // 1. Calculate Overdue High Priority Tasks
  const overdueHighPriority = tasks.filter(
    (t) => t.dueDate && t.dueDate < today && t.priority === 'High' && t.status !== 'Done'
  );

  // 2. Calculate Unassigned Tasks in Active/Upcoming Tasks
  const unassignedTasks = tasks.filter((t) => !t.assignee && t.status !== 'Done');

  // 3. Calculate Phases Near Deadline (< 3 Days remaining & < 50% complete)
  const atRiskPhases = phases.filter((p) => {
    if (!p.endDate || p.status === 'Completed') return false;
    const diffDays = Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3 && (p.progress || 0) < 50;
  });

  const totalRisks = overdueHighPriority.length + unassignedTasks.length + atRiskPhases.length;

  if (totalRisks === 0) return null; // Clean state: Don't render if project is healthy

  return (
    <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 shadow-lg">
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
        <div className="flex items-center gap-2 font-semibold text-amber-400">
          <ShieldAlert className="h-5 w-5" />
          <span>Project Health Alert ({totalRisks} Action Items)</span>
        </div>
        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-mono text-amber-300">
          At Risk
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-sm">
        {overdueHighPriority.map((task) => (
          <div key={task._id} className="flex items-center gap-2 text-red-400">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              <strong>Overdue Blocker:</strong> "{task.title}" was due on {task.dueDate}.
            </span>
          </div>
        ))}

        {unassignedTasks.map((task) => (
          <div key={task._id} className="flex items-center gap-2 text-amber-300">
            <UserX className="h-4 w-4 shrink-0" />
            <span>
              <strong>Unassigned Work:</strong> "{task.title}" has no assigned owner.
            </span>
          </div>
        ))}

        {atRiskPhases.map((phase) => (
          <div key={phase._id} className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Phase Lagging:</strong> "{phase.name}" ends soon but is under 50% completion.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}