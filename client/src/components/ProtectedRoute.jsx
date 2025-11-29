// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null; // you can replace null with a spinner component
  if (!user) {
    // redirect to correct login depending on role
    return <Navigate to={role === "admin" ? "/admin/login" : "/seller/login"} replace />;
  }
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
