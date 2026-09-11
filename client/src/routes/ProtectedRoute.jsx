// src/components/ProtectedRoute.jsx (or inside your AppRoutes.jsx)
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("token");

  if (loading) {
    return <div className="p-4 text-center">Loading session...</div>;
  }

  // Allow access if either user state or token exists
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}