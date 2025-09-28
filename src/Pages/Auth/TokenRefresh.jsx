// TokenRefresh.jsx
import React, { useEffect } from "react";
import { useRefreshTokenMutation } from "../../redux/apiSlices/authSlice";
import { jwtDecode } from "jwt-decode";

const TokenRefresh = () => {
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");
      const refresh = localStorage.getItem("refreshToken");

      // If there is no token or refresh token, stop the check
      if (!token || !refresh) return;

      const decodedToken = jwtDecode(token);
      const tokenExpirationTime = decodedToken.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      // Check if the token has expired
      if (tokenExpirationTime < currentTime) {
        // Token is expired, refresh it
        refreshToken({ refreshToken: refresh })
          .then((response) => {
            if (response.success) {
              // Store the new token
              localStorage.setItem("token", response.data.accessToken);
            }
          })
          .catch((error) => {
            console.error("Token refresh failed:", error);
            // You can redirect to login if the refresh token is invalid
          });
      }
    };

    // Check token expiration on initial mount and every 5 minutes
    checkTokenExpiration();
    const intervalId = setInterval(checkTokenExpiration, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId); // Clean up the interval when the component is unmounted
  }, [refreshToken]);

  return null; // No UI is needed
};

export default TokenRefresh;
