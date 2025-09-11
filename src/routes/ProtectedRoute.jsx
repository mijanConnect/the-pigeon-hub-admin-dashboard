// ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ fixed import

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token); // ✅ fixed usage
    const userRole = decoded?.role;

    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      return children;
    } else {
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
