// src/redux/apiSlices/usermanageSlice.js
import { api } from "../api/baseApi";

const usermanageSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET all users (now with pagination)
    getUsers: builder.query({
      query: ({ page = 10000, limit = 10000 } = {}) => ({
        url: `/usermanage?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (
          !response ||
          !response.success ||
          !response.data ||
          !Array.isArray(response.data.users)
        ) {
          return { users: [], pagination: null };
        }

        return {
          users: response.data.users.map((user) => ({
            _id: user._id,
            id: user._id, // alias for AntD rowKey
            name: user.name || user.email,
            email: user.email,
            role: user.customeRole || user.role,
            phone: user.contact || user.accountInformation?.phone || "N/A",
            status: user.status ? "Active" : "Inactive",
            pages: user.pages || [],
            profile: user.profile || null,
            verified: user.verified || false,
            currentPlan: user.currentPlan || "N/A",
            raw: user,
          })),
          pagination: response.data.pagination,
        };
      },
      providesTags: (result) =>
        result && result.users
          ? [
              ...result.users.map(({ _id }) => ({ type: "Users", id: _id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    // ✅ POST add new user
    addUser: builder.mutation({
      query: (body) => ({
        url: "/usermanage",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    // ✅ PUT update user
    updateUser: builder.mutation({
      query: ({ _id, body }) => ({
        url: `/usermanage/${_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Users", id: _id },
        { type: "Users", id: "LIST" },
      ],
    }),

    // ✅ DELETE user
    deleteUser: builder.mutation({
      query: ({ _id }) => ({
        url: `/usermanage/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Users", id: _id },
        { type: "Users", id: "LIST" },
      ],
    }),

    // ✅ Active/Inactive toggle
    toggleUserStatus: builder.mutation({
      query: ({ _id, status }) => ({
        url: `/usermanage/active-inactive/${_id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Users", id: _id },
        { type: "Users", id: "LIST" },
      ],
    }),

    // ✅ GET all roles
    getRoles: builder.query({
      query: () => ({
        url: "/role",
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response || !response.success || !Array.isArray(response.data))
          return [];
        return response.data.map((role) => ({
          _id: role._id,
          roleName: role.roleName,
        }));
      },
      providesTags: [{ type: "Roles", id: "LIST" }],
    }),

    // ✅ POST add a new role
    addRole: builder.mutation({
      query: (body) => ({
        url: "/role",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Roles", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useAddRoleMutation,
  useToggleUserStatusMutation,
} = usermanageSlice;

export default usermanageSlice;
