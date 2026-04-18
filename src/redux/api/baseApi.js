import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // baseUrl: "http://50.6.200.33:5001/api/v1",
    baseUrl: "https://ftp.thepigeonhub.com/api/v1",

    prepareHeaders: (headers, { endpoint }) => {
      if (!headers.has("Authorization")) {
        const token = localStorage.getItem("token");
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
    "Pedigree",
  ],
  endpoints: () => ({}),
});
