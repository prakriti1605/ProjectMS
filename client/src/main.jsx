import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { OrganisationProvider } from "./context/OrganisationContext";
import { queryClient } from "./api/queryClient";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganisationProvider>
            <AppRoutes />
        </OrganisationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
