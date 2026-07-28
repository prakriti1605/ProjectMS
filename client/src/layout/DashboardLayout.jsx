import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">

      <Sidebar />

      <main className="flex-1 flex flex-col">

        <Topbar />

        <div className="p-8 overflow-y-auto">
          <Outlet />
        </div>

      </main>

    </div>
  );
}