// src/redux/apiSlices/dashboardSlice.js
import { api } from "../api/baseApi";

const dashboardSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get overall dashboard stats
    getOverviewStats: builder.query({
      query: () => ({
        url: "/overview/stats",
        method: "GET",
      }),
      transformResponse: (response) => response.data,
    }),

    // Get recent pigeons from dashboard stats
    getRecentPigeons: builder.query({
      query: () => ({
        url: "/overview/stats",
        method: "GET",
      }),
      transformResponse: (response) => {
        const pigeonsRaw = response?.data?.recentPigeons || [];
        const pigeons = pigeonsRaw.map((pigeon) => ({
          key: pigeon._id,
          image: pigeon.photos?.[0] || "",
          name: pigeon.name,
          country: { name: pigeon.country, icon: "" },
          breeder: pigeon.breeder,
          ringNumber: pigeon.ringNumber,
          birthYear: pigeon.birthYear,
          father: pigeon.fatherRingId ? `${pigeon.fatherRingId.name}` : "-",
          mother: pigeon.motherRingId ? `${pigeon.motherRingId.name}` : "-",
          gender: pigeon.gender,
          status: pigeon.status,
          verified: pigeon.verified ? "Yes" : "No",
          icon: pigeon.verified ? "/assets/verify.png" : "",
          iconic: pigeon.iconic ? "Yes" : "No",
          iconicScore: pigeon.iconicScore || 0,
        }));
        return {
          pigeons,
          pagination: {}, // No pagination info from /overview/stats
        };
      },
    }),

    // Monthly revenue endpoint
    getMonthlyRevenue: builder.query({
      query: (year) => ({
        url: `/overview/monthly-revenue?year=${year}`,
        method: "GET",
      }),
      transformResponse: (response) => response.data || [],
    }),
  }),
});

export const {
  useGetOverviewStatsQuery,
  useGetRecentPigeonsQuery, // renamed
  useGetMonthlyRevenueQuery,
} = dashboardSlice;

export default dashboardSlice;
