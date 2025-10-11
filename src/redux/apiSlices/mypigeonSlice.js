// src/redux/apiSlices/mypigeonSlice.js
import { api } from "../api/baseApi";

const mypigeonSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ---------- GET ALL ----------
    getMyPigeons: builder.query({
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
          url: `/pigeon/myAllpigeons?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        const pigeonArray = response?.data?.data || []; // ✅ actual pigeons array

        const pigeons = pigeonArray.map((pigeon) => ({
          _id: pigeon._id,
          image:
            pigeon.pigeonPhoto ||
            pigeon?.eyePhoto ||
            pigeon?.pedigreePhoto ||
            pigeon?.DNAPhoto ||
            pigeon?.ownershipPhoto ||
            "",
          name: pigeon.name,
          country: { name: pigeon.country, icon: "" },
          breeder: pigeon.breeder?.breederName || "-",
          ringNumber: pigeon.ringNumber,
          birthYear: pigeon.birthYear,
          father: pigeon.fatherRingId
            ? `${pigeon.fatherRingId.ringNumber} (${pigeon.fatherRingId.name})`
            : "-",
          mother: pigeon.motherRingId
            ? `${pigeon.motherRingId.ringNumber} (${pigeon.motherRingId.name})`
            : "-",
          gender: pigeon.gender,
          color: pigeon.color,
          status: pigeon.status,
          verified: pigeon.verified ? "Yes" : "No",
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

    // Add Pigeon
    addPigeon: builder.mutation({
      query: ({ formData, token }) => ({
        url: "/pigeon",
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`, // ✅ only Authorization
          // Remove Content-Type
        },
      }),
      invalidatesTags: [{ type: "Pigeon", id: "LIST" }],
    }),

    // Update Pigeon
    updatePigeon: builder.mutation({
      query: ({ id, formData, token }) => ({
        url: `/pigeon/${id}`,
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`, // ✅ only Authorization
          // Remove Content-Type
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Pigeon", id },
        { type: "Pigeon", id: "LIST" },
      ],
    }),

    // ---------- DELETE ----------
    deletePigeon: builder.mutation({
      query: (id) => ({
        url: `/pigeon/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Pigeon", id },
        { type: "Pigeon", id: "LIST" },
      ],
    }),

    getBreederNames: builder.query({
      query: () => ({
        url: "/breeder", // ✅ adjust according to your backend route
        method: "GET",
      }),
      transformResponse: (response) => {
        // assuming response.data contains array of breeders
        return (
          response?.data?.breeder?.map((b) => ({
            _id: b._id,
            breederName: b.breederName,
          })) || []
        );
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((b) => ({ type: "Breeder", id: b._id })),
              { type: "Breeder", id: "LIST" },
            ]
          : [{ type: "Breeder", id: "LIST" }],
    }),

    getPigeonSearch: builder.query({
      query: (searchTerm) => ({
        url: `/pigeon/getAllPigeonsAdmin`,
        method: "GET",
        params: { searchTerm },
      }),
      transformResponse: (response) => {
        return response?.data?.data || [];
      },
    }),
  }),
});

export const {
  useGetMyPigeonsQuery,
  useGetPigeonSearchQuery,
  useGetSinglePigeonQuery, // ✅ New hook
  useAddPigeonMutation,
  useUpdatePigeonMutation, // ✅
  useDeletePigeonMutation,
  useGetBreederNamesQuery, // ✅ New hook for breeder names
} = mypigeonSlice;
