import React from "react";
import { CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, Download } from "lucide-react";

export default function InsightsTab({ tasks = [] }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Done").length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const today = new Date().toISOString().split("T")[0];
  const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== "Done");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold">Insights & Analytics</h2>
          <p className="text-sm text-gray-400">Project Performance & Velocity Health</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#1E1E24] px-4 py-2 text-xs font-semibold hover:bg-white/5">
          <Download className="h-3.5 w-3.5" /> Export Report
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#1E1E24] p-5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>TOTAL TASKS</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{completedTasks}/{totalTasks}</div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-[#121212]">
            <div className="h-full rounded-full bg-orange-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1E1E24] p-5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>OVERALL PROGRESS</span>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">{progressPercent}%</div>
          <span className="text-xs text-emerald-400">+12% from last week</span>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <div className="flex items-center justify-between text-xs text-red-300">
            <span>OVERDUE TASKS</span>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-red-400">{overdueTasks.length}</div>
          <span className="text-xs text-red-300">Requires attention</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1E1E24] p-5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>HEALTH SCORE</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-bold text-white">92<span className="text-lg text-gray-500">/100</span></div>
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 font-semibold">On Track</span>
        </div>
      </div>

      {/* Analytics Watchlist section */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 rounded-xl border border-white/10 bg-[#1E1E24] p-6">
          <h3 className="text-md font-semibold text-gray-200">Completion Velocity</h3>
          <div className="mt-8 flex h-48 items-end justify-between gap-2 border-b border-white/10 pb-2 px-4">
            <div className="w-12 bg-orange-600/30 rounded-t h-[20%] text-center text-xs pt-1">Wk 1</div>
            <div className="w-12 bg-orange-600/50 rounded-t h-[45%] text-center text-xs pt-1">Wk 2</div>
            <div className="w-12 bg-orange-600/70 rounded-t h-[65%] text-center text-xs pt-1">Wk 3</div>
            <div className="w-12 bg-orange-500 rounded-t h-[85%] text-center text-xs pt-1 font-bold">Wk 4</div>
          </div>
        </div>

        <div className="col-span-4 rounded-xl border border-white/10 bg-[#1E1E24] p-6">
          <h3 className="text-md font-semibold text-gray-200 mb-4">Risk Watchlist</h3>
          <div className="space-y-3">
            {overdueTasks.length === 0 ? (
              <p className="text-xs text-gray-500">No overdue items detected.</p>
            ) : (
              overdueTasks.map((t) => (
                <div key={t._id} className="rounded border border-red-500/20 bg-red-500/5 p-3 text-xs">
                  <div className="font-semibold text-red-300">{t.title}</div>
                  <div className="mt-1 text-gray-400">Due: {t.dueDate}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}