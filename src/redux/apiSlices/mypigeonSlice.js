// src/redux/apiSlices/mypigeonSlice.js
import { api } from "../api/baseApi";

const mypigeonSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ---------- GET ALL ----------
    getMyPigeons: builder.query({
      query: ({
        page = 1,
        limit = 10000,
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
          DNAPhoto: pigeon?.DNAPhoto || "",
          pedigreePhoto: pigeon?.pedigreePhoto || "",
          ownershipPhoto: pigeon?.ownershipPhoto || "",
          pigeonPhoto: pigeon?.pigeonPhoto || "",
          name: pigeon.name || "N/A",
          country: { name: pigeon.country, icon: "" },
          breeder: pigeon.breeder?.loftName || "N/A",
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
          icon: pigeon.verified ? "/assets/verify.png" : "",
        }));

        return {
          pigeons,
          pagination: response?.data?.pagination || {},
        };
      },

      providesTags: (result) =>
        result
          ? [
              ...result.pigeons.map((p) => ({ type: "Pigeon", id: p._id })),
              { type: "Pigeon", id: "LIST" },
              { type: "AddPigeon", id: "LIST" },
            ]
          : [
              { type: "Pigeon", id: "LIST" },
              { type: "AddPigeon", id: "LIST" },
            ],
    }),

    // ---------- GET SINGLE PIGEON ----------
    getSinglePigeon: builder.query({
      query: (id) => ({
        url: `/pigeon/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Pigeon", id }],
    }),

    // ---------- GET SIBLINGS ----------
    getSiblings: builder.query({
      query: (id) => ({
        url: `/pigeon/siblings/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Pigeon", id }],
    }),

    // ---------- GET All SIBLINGS ----------
    getAllSiblings: builder.query({
      query: (id) => ({
        url: `/pigeon/siblings/${id}`,
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
      invalidatesTags: ["AddPigeon"],
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
        { type: "RecentPigeons", id: "LIST" },
        { type: "OverviewStats", id: "LIST" },
      ],
    }),

    // ---------- DELETE ----------
    deletePigeon: builder.mutation({
      query: (id) => ({
        url: `/pigeon/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AddPigeon"],
    }),

    getBreederNames: builder.query({
      query: (limit = 10000) => ({
        url: `/breeder/verify?limit=${limit}`, // ✅ adjust according to your backend route
        method: "GET",
      }),
      transformResponse: (response) => {
        // assuming response.data contains array of breeders
        return (
          response?.data?.breeder?.map((b) => ({
            _id: b._id,
            breederName: b.loftName,
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
    getFatherMother: builder.query({
      query: (searchTerm) => ({
        url: `/pigeon/searchAllPigeon`,
        method: "GET",
        params: { searchTerm },
      }),
      transformResponse: (response) => {
        return response?.data || [];
      },
      providesTags: ["Pigeon"],
    }),

    getAllName: builder.query({
      query: () => ({
        url: `/pigeon/searchAllName`,
        method: "GET",
      }),
      transformResponse: (response) => {
        return response?.data || [];
      },
      providesTags: ["Pigeon"],
    }),

    getAllRingCountry: builder.query({
      query: () => ({
        url: `/pigeon/check-duplicate`,
        method: "GET",
      }),
      transformResponse: (response) => {
        return response?.data || [];
      },
      providesTags: ["Pigeon"],
    }),
  }),
});

export const {
  useGetMyPigeonsQuery,
  useGetPigeonSearchQuery,
  useGetSinglePigeonQuery, // ✅ New hook
  useGetSiblingsQuery, // ✅ New hook
  useGetAllSiblingsQuery, // ✅ New hook
  useAddPigeonMutation,
  useUpdatePigeonMutation, // ✅
  useDeletePigeonMutation,
  useGetBreederNamesQuery,
  useGetFatherMotherQuery,
  useGetAllNameQuery,
  useGetAllRingCountryQuery,
} = mypigeonSlice;
