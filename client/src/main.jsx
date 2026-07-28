import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { OrganisationProvider } from "./context/OrganisationContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <OrganisationProvider>
          <AppRoutes />
      </OrganisationProvider>
    </AuthProvider>
  </React.StrictMode>
);