// src/components/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, role, name, isActive?, email? }
  const [loading, setLoading] = useState(true);

  // Restore session (calls GET /auth/me)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Auth restore failed", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // login({ emailOrUsername, password, role: 'admin'|'seller' })
  const login = async ({ emailOrUsername, password, role }) => {
    try {
      const endpoint = role === "admin" ? "/admin/login" : "/sellers/login";
      const payload =
        role === "admin"
          ? { username: emailOrUsername, password }
          : { email: emailOrUsername, password };

      const res = await API.post(endpoint, payload);
      const { token } = res.data;
      if (!token) throw new Error("No token from server");
      localStorage.setItem("token", token);

      // fetch /auth/me to get normalized user info
      const me = await API.get("/auth/me");
      setUser(me.data);
      return { success: true };
    } catch (err) {
      console.error("login error", err?.response?.data || err.message);
      return { success: false, message: err?.response?.data?.message || "Login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
