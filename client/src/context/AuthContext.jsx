// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { disconnectSocket } from "../api/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 1. Track context loading state
  const [activeMembership, setActiveMembership] = useState(null);

//mtlb jab app initially load hoga toh hum authcontext set karenge. agar localstorage mein user aur token hoga toh ussey restor ekarenge otherwise. Aur agar half baked data hoga ki suppose user hai but token nhi toh sab kuch reset. 
useEffect(() => {
  const savedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const savedMembership = localStorage.getItem("activeMembership");

  if (savedUser && token) {
    try {
      setUser(JSON.parse(savedUser));
      if (savedMembership) {
        setActiveMembership(JSON.parse(savedMembership));
      }
    } catch (err) {
      console.error("Failed to parse stored session", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("activeMembership");
    }
  }
  setLoading(false);
}, []);

// 2. Helper function to update state + localStorage together
const updateActiveMembership = (membershipData) => {
  if (membershipData) {
    localStorage.setItem("activeMembership", JSON.stringify(membershipData));
  } else {
    localStorage.removeItem("activeMembership");
  }
  setActiveMembership(membershipData);
};
// ye login fn, jab login execute hoga aur backend response bhejega toh uss response ko local storage mein set kar denge.
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
  // same for register. yaha register hoke aap directly access kar rahe ho, dashboard ko, you dont need to login again. 

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
//logout ke time sab kuch localstorage se remove kar denge. 
  const logout = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeMembership");
    setUser(null);
    setActiveMembership(null);
    queryClient.clear();
  };
//most important. this function is used by several components.It checks for permissions in the activemembership. 
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
