// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const api = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "http://10.10.7.41:5001/api/v1",
//   }),
//   endpoints: () => ({}),
// });

// // export const imageUrl = "http://206.189.231.81:5000";
// export const imageUrl = "http://206.189.231.81:5000";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://10.10.7.41:5001/api/v1",
    // baseUrl: "http://10.10.7.46:5006/api/v1",
    // prepareHeaders: (headers) => {
    //   headers.set("ngrok-skip-browser-warning", "true");
    //   const token = localStorage.getItem("token");
    //   if (token) {
    //     headers.set("authorization", `Bearer ${token}`);
    //   }
    //   return headers;
    // },
    prepareHeaders: (headers) => {
      headers.set("ngrok-skip-browser-warning", "true");
      const token = localStorage.getItem("token");
      console.log("📤 Sending token in headers:", token); // 🔹 debug
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Admin", "Profile", "Faq"],

  endpoints: () => ({}),
});

export const imageUrl = "http://75.119.138.163:5006";
