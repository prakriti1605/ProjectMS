import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Organisations from "../pages/Organisations";
import OrganisationDetails from "../pages/OrganisationDetails";


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
          </Route>
        </Route>

        {/* default */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}