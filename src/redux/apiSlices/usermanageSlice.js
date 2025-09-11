// src/redux/apiSlices/usermanageSlice.js
import { api } from "../api/baseApi"; // make sure baseApi is already setup

const usermanageSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: "/usermanage",
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) return [];
        return response.data.map((user) => ({
          id: user._id,
          name: user.profile || "N/A",
          email: user.email,
          role: user.role,
          phone: user.accountInformation?.phone || "N/A",
          status: user.accountInformation?.status ? "Active" : "Inactive",
        }));
      },
    }),
  }),
});

export const { useGetUsersQuery } = usermanageSlice;
