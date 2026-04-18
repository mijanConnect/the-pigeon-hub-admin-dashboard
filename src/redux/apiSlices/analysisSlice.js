import { api } from "../api/baseApi";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const analyticSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: () => ({ url: "/analytic", method: "GET" }),
      transformResponse: (response) => {
        const raw = response?.data || {};
        const rowsMap = {};

        // revenue
        raw.revenue?.forEach((item) => {
          const { month, year } = item._id;
          const label = `${monthNames[month - 1]} ${year}`;
          rowsMap[label] = rowsMap[label] || { date: label };
          rowsMap[label].Revenue = item.totalRevenue;
        });

        // user activity
        raw.userActivity?.forEach((item) => {
          const { month, year } = item._id;
          const label = `${monthNames[month - 1]} ${year}`;
          rowsMap[label] = rowsMap[label] || { date: label };
          rowsMap[label]["User Activity"] = item.totalActivity;
        });

        // pedigree stats
        raw.pedigreeStats?.forEach((item) => {
          const { month, year } = item._id;
          const label = `${monthNames[month - 1]} ${year}`;
          rowsMap[label] = rowsMap[label] || { date: label };
          rowsMap[label]["Pedigree Statistics"] = item.totalPedigree;
        });

        // convert map to sorted array
        const chartData = Object.values(rowsMap).sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        );

        return { chartData };
      },
    }),
  }),
});

export const { useGetAnalyticsQuery } = analyticSlice;
