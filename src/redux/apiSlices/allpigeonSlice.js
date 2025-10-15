// src/redux/apiSlices/allpigeonSlice.js
import { api } from "../api/baseApi";

const allpigeonSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ---------- GET ALL PIGEONS WITH FILTERS ----------
    getAllPigeons: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search,
        searchTerm,
        country,
        gender,
        color,
        verified,
        status,
      }) => {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        if (search) params.append("search", search);
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (country) params.append("country", country);
        if (gender) params.append("gender", gender);
        if (color) params.append("color", color);
        if (verified !== undefined) params.append("verified", verified);
        if (status) params.append("status", status);
        return {
          url: `/pigeon/getAllPigeonsAdmin?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        const pigeonArray = response?.data?.data || []; // actual pigeons array

        const pigeons = pigeonArray.map((pigeon) => ({
          _id: pigeon._id,
          image:
            pigeon.pigeonPhoto ||
            pigeon?.eyePhoto ||
            pigeon?.pedigreePhoto ||
            pigeon?.DNAPhoto ||
            pigeon?.ownershipPhoto ||
            "",
          name: pigeon.name || "N/A",
          country: pigeon.country || "N/A",
          breeder: pigeon.breeder?.breederName || "N/A",
          ringNumber: pigeon.ringNumber || "N/A",
          birthYear: pigeon.birthYear || "N/A",
          father: pigeon.fatherRingId
            ? `${pigeon.fatherRingId.ringNumber}`
            : "N/A",
          mother: pigeon.motherRingId
            ? `${pigeon.motherRingId.ringNumber}`
            : "N/A",
          gender: pigeon.gender || "N/A",
          color: pigeon.color || "N/A",
          status: pigeon.status || "N/A",
          verified: pigeon.verified ? "Yes" : "No",
          iconic: pigeon.iconic || "N/A",
          iconicScore: pigeon.iconicScore || 0,
          pigeonId: pigeon.pigeonId || "N/A",
          icon: pigeon.verified ? "/assets/verify.png" : "",
        }));

        return {
          pigeons,
          pagination: response?.data?.pagination || {},
        };
      },
      providesTags: (result) =>
        result?.pigeons
          ? [
              ...result.pigeons.map((p) => ({ type: "Pigeon", id: p._id })),
              { type: "Pigeon", id: "LIST" },
            ]
          : [{ type: "Pigeon", id: "LIST" }],
    }),

    // ---------- GET SINGLE PIGEON ----------
    getSinglePigeon: builder.query({
      query: (id) => ({
        url: `/pigeon/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Pigeon", id }],
    }),

    // ---------- UPDATE PIGEON ----------
    updatePigeon: builder.mutation({
      query: ({ id, formData, token }) => ({
        url: `/pigeon/${id}`,
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Pigeon", id },
        { type: "Pigeon", id: "LIST" },
        { type: "RecentPigeons", id: "LIST" },
        { type: "OverviewStats", id: "LIST" },
      ],
    }),

    // ---------- DELETE PIGEON ----------
    deletePigeon: builder.mutation({
      query: (id) => ({
        url: `/pigeon/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Pigeon", id },
        { type: "Pigeon", id: "LIST" },
        { type: "RecentPigeons", id: "LIST" },
        { type: "OverviewStats", id: "LIST" },
      ],
    }),

    // ---------- TOGGLE PIGEON STATUS ----------
    togglePigeonStatus: builder.mutation({
      query: ({ _id, status }) => ({
        url: `/pigeon/${_id}/status`,
        method: "PATCH",
        body: { status: status ? "Active" : "Inactive" },
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Pigeon", id: _id },
        { type: "Pigeon", id: "LIST" },
        { type: "RecentPigeons", id: "LIST" },
        { type: "OverviewStats", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllPigeonsQuery,
  useGetSinglePigeonQuery,
  useUpdatePigeonMutation,
  useDeletePigeonMutation,
  useTogglePigeonStatusMutation,
} = allpigeonSlice;
