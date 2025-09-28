// ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { id } = useParams();

  // If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded?.role;
    const userPages = JSON.parse(localStorage.getItem("pages"));

    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      // Admins and Super Admins have access to all pages
      return children;
    }

    if (userPages && userPages.includes("overview")) {
      if (location.pathname === "/") {
        return children;
      }
    }

    if (userPages && userPages.includes("analytics")) {
      if (location.pathname === "/reportingAnalytics") {
        return children;
      }
    }

    if (userPages && userPages.includes("breeder")) {
      if (location.pathname === "/verify-breeder") {
        return children;
      }
    }

    if (userPages && userPages.includes("package")) {
      if (location.pathname === "/subscription") {
        return children;
      }
    }

    if (userPages && userPages.includes("userManagement")) {
      if (location.pathname === "/user-management") {
        return children;
      }
    }

    if (userPages && userPages.includes("pigeon")) {
      if (location.pathname === "/my-pigeon") {
        return children;
      }
    }

    if (userPages && userPages.includes("pigeon")) {
      if (location.pathname === "/add-pigeon") {
        return children;
      }
    }

    if (userPages && userPages.includes("pigeon")) {
      if (location.pathname === `/pigeon-management/${id}`) {
        return children;
      }
    }

    if (userPages && userPages.includes("pigeon")) {
      if (location.pathname === "/pigeon-management") {
        return children;
      }
    }

    const currentPage = location.pathname.split("/").pop();

    // If the current page is in the list of pages the user can access
    if (userPages && userPages.includes(currentPage)) {
      return children;
    } else {
      // If not authorized, redirect to a "Not Authorized" page
      return (
        <Navigate to="/not-authorized" state={{ from: location }} replace />
      );
    }
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
