import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // LOAD USER ON APP START (refresh handling)
  const loadUser = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");

      const userData = res.data.user || res.data;
      setUser(userData);
    } catch (err) {
      localStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // LOGIN
  const login = async (credentials) => {
    const res = await api.post("/auth/login", credentials);

    const { token, user } = res.data;

    localStorage.setItem("access_token", token);
    setUser(user);

    return res.data;
  };

  // REGISTER
  const register = async (data) => {
    const res = await api.post("/auth/register", data);

    const { token, user } = res.data;

    if (token) {
      localStorage.setItem("access_token", token);
      setUser(user);
    }

    return res.data;
  };

  // LOGOUT
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // ignore backend errors
    } finally {
      localStorage.removeItem("access_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}