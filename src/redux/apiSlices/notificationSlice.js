// src/redux/apiSlices/notificationSlice.js
import { api } from "../api/baseApi";

const notificationSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getRecentNotifications: builder.query({
      query: (limit = 10) => ({
        url: `/notification/recentNotification?limit=${limit}`,
        method: "GET",
      }),
      transformResponse: (response) => response.data.notification || [],
      providesTags: ["Notification"],
    }),

    getNotifications: builder.query({
      query: (page = 1) => ({
        url: `/notification/admin`,
        method: "GET",
        params: { page, limit: 10 }, // adjust limit if needed
      }),
      transformResponse: (response) => response.data,
      providesTags: ["Notification"],
    }),

    readAllNotifications: builder.mutation({
      query: () => ({
        url: `/notification/admin`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    // ✅ NEW: Unread Count API
    getUnreadNotificationCount: builder.query({
      query: () => ({
        url: `/notification/unreadCount`,
        method: "GET",
      }),
      transformResponse: (response) => response.data.unreadCount || 0,
      providesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetRecentNotificationsQuery,
  useGetNotificationsQuery,
  useReadAllNotificationsMutation,
  useGetUnreadNotificationCountQuery, // ✅ Export this
} = notificationSlice;
