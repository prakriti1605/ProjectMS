import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold leading-none">
              P
            </span>
          </div>

          <span className="text-base font-semibold text-foreground tracking-tight">
            ProjectMS
          </span>
        </div>

        <Outlet />
      </div>
    </div>
  );
}