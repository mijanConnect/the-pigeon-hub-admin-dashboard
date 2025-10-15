// src/redux/apiSlices/dashboardSlice.js
import { api } from "../api/baseApi";

const dashboardSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get overall dashboard stats
    getOverviewStats: builder.query({
      // accept an optional filterBy param (e.g. '1month', '7days')
      query: (filterBy) => ({
        url: `/overview/stats${filterBy ? `?filterBy=${filterBy}` : ""}`,
        method: "GET",
      }),
      transformResponse: (response) => response.data,
      // provide a simple tag so mutations can invalidate overview data
      providesTags: (result) => [{ type: "OverviewStats", id: "LIST" }],
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
          key: pigeon?._id,
          image:
            pigeon.pigeonPhoto ||
            pigeon?.eyePhoto ||
            pigeon?.pedigreePhoto ||
            pigeon?.DNAPhoto ||
            pigeon?.ownershipPhoto ||
            "",
          name: pigeon?.name || "N/A",
          country: { name: pigeon?.country, icon: "" } || {
            name: "N/A",
            icon: "",
          },
          breeder: pigeon?.breeder?.breederName || "N/A",
          ringNumber: pigeon?.ringNumber || "N/A",
          birthYear: pigeon?.birthYear || "N/A",
          father: pigeon?.fatherRingId
            ? `${pigeon?.fatherRingId?.ringNumber}`
            : "N/A",
          mother: pigeon?.motherRingId
            ? `${pigeon?.motherRingId?.ringNumber}`
            : "N/A",
          gender: pigeon?.gender || "N/A",
          status: pigeon?.status || "N/A",
          verified: pigeon?.verified ? "Yes" : "No",
          icon: pigeon?.verified ? "/assets/verify.png" : "",
          iconic: pigeon?.iconic ? "Yes" : "No",
          iconicScore: pigeon?.iconicScore || 0,
        }));
        return {
          pigeons,
          pagination: {}, // No pagination info from /overview/stats
        };
      },
      // Provide tags for the recent pigeons list and each item so callers can
      // invalidate either the whole list or specific pigeon entries.
      providesTags: (result) =>
        result && result.pigeons
          ? [
              { type: "RecentPigeons", id: "LIST" },
              ...result.pigeons.map((p) => ({
                type: "RecentPigeons",
                id: p.key,
              })),
            ]
          : [{ type: "RecentPigeons", id: "LIST" }],
    }),

    // Monthly revenue endpoint
    getMonthlyRevenue: builder.query({
      query: (year) => ({
        url: `/overview/monthly-revenue?year=${year}`,
        method: "GET",
      }),
      transformResponse: (response) => response.data || [],
      // Tag monthly revenue by year so updates for a given year can invalidate it
      providesTags: (result, error, year) => [
        { type: "MonthlyRevenue", id: year ?? "ALL" },
      ],
    }),
  }),
});

export const {
  useGetOverviewStatsQuery,
  useGetRecentPigeonsQuery, // renamed
  useGetMonthlyRevenueQuery,
} = dashboardSlice;

export default dashboardSlice;
