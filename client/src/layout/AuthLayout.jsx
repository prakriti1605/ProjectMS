import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl shadow-slate-900/10 backdrop-blur-sm">
        <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-10 text-white relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[28px] border-primary/20" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full border-[36px] border-cyan-300/10" />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-orange-500/25">
                <span className="text-primary-foreground text-base font-bold leading-none">P</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">ProjectMS</span>
            </div>
            <div className="mt-20 max-w-xs">
              <p className="text-xs uppercase tracking-[0.24em] text-orange-300/80">Work in motion</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">Bring every project into focus.</h1>
              <p className="mt-5 text-sm leading-6 text-slate-300">Plan clearly, keep teams aligned, and see progress unfold in real time.</p>
            </div>
          </div>
          <p className="relative text-xs text-slate-400">One workspace for better momentum.</p>
        </div>

        <div className="p-5 sm:p-8 lg:p-12">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold leading-none">
              P
            </span>
            </div>

            <span className="text-base font-semibold text-foreground tracking-tight">ProjectMS</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}