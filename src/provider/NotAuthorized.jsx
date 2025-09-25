// NotAuthorized.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotAuthorized = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-semibold mb-3">Not Authorized</h1>
        <p className="text-gray-600 mb-6">
          You don’t have permission to access this page. If you think this is a
          mistake, please contact an administrator.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Go Home
          </Link>
          <Link
            to="/auth/login"
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;
