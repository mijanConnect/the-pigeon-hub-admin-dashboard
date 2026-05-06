// src/redux/apiSlices/usermanageSlice.js
import { api } from "../api/baseApi";

const usermanageSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET all users (now with pagination)
    getUsers: builder.query({
      query: ({ page = 1, limit = 10000 } = {}) => ({
        url: `/usermanage?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        console.log("API Response:", response);

        // Handle different response structures
        let usersArray = [];
        let paginationData = null;

        // Case 1: response.data.users
        if (response?.data?.users && Array.isArray(response.data.users)) {
          usersArray = response.data.users;
          paginationData = response.data.pagination || null;
        }
        // Case 2: response.data is directly the users array
        else if (Array.isArray(response?.data)) {
          usersArray = response.data;
        }
        // Case 3: response is directly the users array
        else if (Array.isArray(response)) {
          usersArray = response;
        }
        // Case 4: response has users property at top level
        else if (response?.users && Array.isArray(response.users)) {
          usersArray = response.users;
          paginationData = response.pagination || null;
        }

        if (!Array.isArray(usersArray) || usersArray.length === 0) {
          console.warn("No users found in API response");
          return { users: [], pagination: null };
        }

        return {
          users: usersArray.map((user) => ({
            _id: user._id,
            id: user._id,
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
          pagination: paginationData,
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

    // ✅ POST add new admin (PAIDUSER)
    addAdmin: builder.mutation({
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
        console.log("Roles API Response:", response);

        let rolesArray = [];

        // Case 1: response.data is array
        if (Array.isArray(response?.data)) {
          rolesArray = response.data;
        }
        // Case 2: response.data.roles is array
        else if (Array.isArray(response?.data?.roles)) {
          rolesArray = response.data.roles;
        }
        // Case 3: response is directly array
        else if (Array.isArray(response)) {
          rolesArray = response;
        }

        if (!Array.isArray(rolesArray) || rolesArray.length === 0) {
          console.warn("No roles found in API response");
          return [];
        }

        return rolesArray.map((role) => ({
          _id: role._id,
          roleName: role.roleName || role.name,
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
  useAddAdminMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useAddRoleMutation,
  useToggleUserStatusMutation,
} = usermanageSlice;

export default usermanageSlice;
