import React from "react";

export default function BandwidthSummary({ summary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase font-semibold text-slate-400">Available Bandwidth</p>
          <h3 className="text-2xl font-bold text-blue-400 mt-0.5">
            {summary.available} <span className="text-sm font-normal text-slate-400">Members</span>
          </h3>
        </div>
        <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
          Ready
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase font-semibold text-slate-400">Optimal Load</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">
            {summary.optimal} <span className="text-sm font-normal text-slate-400">Members</span>
          </h3>
        </div>
        <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          Balanced
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase font-semibold text-slate-400">Overloaded</p>
          <h3 className="text-2xl font-bold text-rose-400 mt-0.5">
            {summary.overloaded} <span className="text-sm font-normal text-slate-400">Members</span>
          </h3>
        </div>
        <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
          Action Needed
        </span>
      </div>
    </div>
  );
}