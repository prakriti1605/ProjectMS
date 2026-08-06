// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 1. Track context loading state
  const [activeMembership, setActiveMembership] = useState(null);

  // Initialize user session on initial app load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse stored user", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false); // 2. Done checking localStorage
  }, []);

  const login = async (formData) => {
    const response = await api.post("/auth/login", formData);
    const { user: userData, token } = response.data;

    if (token) localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    return response.data;
  };
  const register = async (formData) => {
  const response = await api.post("/auth/register", formData);
  const { user: userData, token } = response.data;

  if (token) localStorage.setItem("token", token);
  if (userData) {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }
  return response.data;
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeMembership");
    setUser(null);
    setActiveMembership(null);
  };

  const hasPermission = (permissionKey) => {
    if (!activeMembership) return false;
    if (activeMembership.role === "owner") return true;
    return activeMembership.permissions?.includes(permissionKey) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading, // Expose loading state
        activeMembership,
        setActiveMembership,
        hasPermission,
      }}
    >
      {/* 3. Don't render routes until session state is verified */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);