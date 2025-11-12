import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // baseUrl: "http://10.10.7.41:5001/api/v1",
    baseUrl: "https://ftp.thepigeonhub.com/api/v1",

    prepareHeaders: (headers, { endpoint }) => {
      // headers.set("ngrok-skip-browser-warning", "true");

      // Don't override Authorization header if it's already set by the endpoint
      if (!headers.has("Authorization")) {
        const token = localStorage.getItem("token");

        // console.log("📤 Sending token in headers:", token);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Admin",
    "Profile",
    "Faq",
    "Pigeon",
    "Breeder",
    "AddPigeon",
  ],
  endpoints: () => ({}),
});

export const imageUrl = "http://75.119.138.163:5006";
// export const imageUrl = "http://50.6.200.33:5001";
