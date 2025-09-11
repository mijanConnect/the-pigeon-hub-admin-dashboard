import { api } from "../api/baseApi";

export const profileSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile
    getProfile: builder.query({
      query: () => "/user/profile",
      transformResponse: (response) => ({
        id: response?.data?._id,
        name: response?.data?.name,
        email: response?.data?.email,
        contact: response?.data?.contact,
        role: response?.data?.role,
        profileImage: response?.data?.profile,
        verified: response?.data?.verified,
        totalPigeons: response?.data?.totalPigeons,
        ...response?.data,
      }),
      providesTags: ["Profile"],
    }),

    // Update profile
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: "/user",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Profile"],
    }),

    // Change password
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: "/auth/change-password",
        method: "POST", // backend expects PATCH
        body: {
          currentPassword: passwordData.current_password,
          newPassword: passwordData.new_password,
          confirmPassword: passwordData.confirm_password,
        },
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = profileSlice;
