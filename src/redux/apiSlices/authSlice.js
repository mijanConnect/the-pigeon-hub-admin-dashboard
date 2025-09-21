import { api } from "../api/baseApi";

const authSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    otpVerify: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "/auth/otp-verify",
          body: data,
        };
      },
    }),
    login: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "/auth/login",
          body: data,
        };
      },
      transformResponse: (data) => {
        return data;
      },
      transformErrorResponse: ({ data }) => {
        const { message } = data;
        return message;
      },
    }),
    forgotPassword: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "/auth/forgot-password",
          body: data,
        };
      },
    }),
    verifyEmail: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "/auth/verify-email",
          body: data,
        };
      },
    }),

    resendOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: data, // { email: "user@example.com" }
      }),
    }),

    // Try different approaches for reset password
    resetPassword: builder.mutation({
      query: ({ newPassword, confirmPassword, token }) => {
        console.log("🔹 Reset password mutation - token received:", token);
        console.log("🔹 Request body:", { newPassword, confirmPassword });

        // Try approach 1: Bearer token in Authorization header
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        console.log("🔹 Headers being sent:", headers);

        return {
          url: "/auth/reset-password",
          method: "POST",
          body: {
            newPassword,
            confirmPassword,
          },
          headers: headers,
        };
      },
    }),

    // Alternative approach 1: Token without Bearer prefix
    resetPasswordAlt1: builder.mutation({
      query: ({ newPassword, confirmPassword, token }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: {
          newPassword,
          confirmPassword,
        },
        headers: {
          Authorization: token, // Just the token without Bearer
          "Content-Type": "application/json",
        },
      }),
    }),

    // Alternative approach 2: Token in body
    resetPasswordAlt2: builder.mutation({
      query: ({ newPassword, confirmPassword, token }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: {
          newPassword,
          confirmPassword,
          token, // Token in body
        },
      }),
    }),

    // Alternative approach 3: Custom header name
    resetPasswordAlt3: builder.mutation({
      query: ({ newPassword, confirmPassword, token }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: {
          newPassword,
          confirmPassword,
        },
        headers: {
          "Reset-Token": token, // Different header name
          "Content-Type": "application/json",
        },
      }),
    }),

    changePassword: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "/auth/change-password",
          body: data,
          headers: {
            Authorization: `Bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        };
      },
    }),

    updateProfile: builder.mutation({
      query: (data) => {
        return {
          method: "POST",
          url: "/auth/update-profile",
          body: data,
          headers: {
            Authorization: `Bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        };
      },
    }),

    profile: builder.query({
      query: () => {
        return {
          method: "GET",
          url: "/auth/get-profile",
          headers: {
            Authorization: `Bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        };
      },
      transformResponse: ({ user }) => {
        return user;
      },
    }),
  }),
});

export const {
  useOtpVerifyMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyEmailMutation,
  useResetPasswordMutation,
  useResetPasswordAlt1Mutation,
  useResetPasswordAlt2Mutation,
  useResetPasswordAlt3Mutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useProfileQuery,
  useResendOtpMutation, // ✅ added
} = authSlice;
