import React from "react";

const colorStyles = {
  orange: {
    borderHover: "hover:border-orange-500/50",
    iconBg: "bg-orange-500/10 border-orange-500/20 text-orange-500",
    glow: "group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]",
    topAccent: "bg-orange-500",
  },
  amber: {
    borderHover: "hover:border-amber-500/50",
    iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    topAccent: "bg-amber-500",
  },
  rose: {
    borderHover: "hover:border-rose-500/50",
    iconBg: "bg-rose-500/10 border-rose-500/20 text-rose-500",
    glow: "group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    topAccent: "bg-rose-500",
  },
  emerald: {
    borderHover: "hover:border-emerald-500/50",
    iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    topAccent: "bg-emerald-500",
  },
};

export default function StatCard({ title, value, icon: Icon, color = "orange", subtitle }) {
  const theme = colorStyles[color] || colorStyles.orange;

  return (
    <div
      className={`group relative bg-card border border-border rounded-lg p-3.5 transition-all duration-300 ${theme.borderHover} ${theme.glow} overflow-hidden`}
    >
      {/* Subtle top indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${theme.topAccent} opacity-70`} />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-zinc-500">{subtitle}</p>
          )}
        </div>

        {/* Icon Container */}
        <div className={`p-3 rounded-lg border ${theme.iconBg} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}