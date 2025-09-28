import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://10.10.7.41:5001/api/v1",
    // baseUrl: "http://50.6.200.33:5001/api/v1",

    // baseUrl: "http://206.162.244.155:5001/api/v1",
    // baseUrl: "http://10.10.7.46:5006/api/v1",
    prepareHeaders: (headers, { endpoint }) => {
      // headers.set("ngrok-skip-browser-warning", "true");

      // Don't override Authorization header if it's already set by the endpoint
      if (!headers.has("Authorization")) {
        const token = localStorage.getItem("token");

        console.log("📤 Sending token in headers:", token);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Admin", "Profile", "Faq", "Pigeon", "Breeder"],
  endpoints: () => ({}),
});

export const imageUrl = "http://75.119.138.163:5006";
// export const imageUrl = "http://50.6.200.33:5001";
