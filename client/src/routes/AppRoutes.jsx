import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Organisations from "../pages/Organisations";
import OrganisationDetails from "../pages/OrganisationDetails";
import ProjectDetails from "../pages/ProjectDetails";
import Projects from "../pages/Project";
import Members from "../pages/Members";
import JoinOrg from "../components/JoinOrg";
import CreateOrganisation from "../pages/CreateOrganisation";
import OrganisationSettings from "../pages/OrganisationSettings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/organisations" element={<Organisations />} />
            <Route path="/org/:id" element={<OrganisationDetails />} />
            <Route
              path="/org/:id/settings"
              element={<OrganisationSettings />}
            />
            <Route
              path="/projects"
              element={<Projects />}
            />
            <Route
              path="/members"
              element={<Members />}
            />
            <Route
              path="/join-organisation"
              element={<JoinOrg />}
            />
            <Route
              path="/create-organisation"
              element={<CreateOrganisation />}
            />
            <Route path="/projects/:orgId/:projectId" element={<ProjectDetails />} />
         </Route>
        </Route>

        {/* default */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}