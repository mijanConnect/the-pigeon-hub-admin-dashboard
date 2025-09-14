// src/redux/apiSlices/breederSlice.js
import { api } from "../api/baseApi";

const breederSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ---------- GET ALL BREEDERS ----------
    getBreeders: builder.query({
      query: ({ page = 1, limit = 10, search, country, gender, status }) => {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        if (search) params.append("search", search);
        if (country && country !== "all") params.append("country", country);
        if (gender && gender !== "all") params.append("gender", gender);
        if (status !== undefined && status !== "all")
          params.append("status", status === "Active" ? true : false);

        return {
          url: `/breeder?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        const breeders = response?.data?.breeder?.map((b) => ({
          key: b._id,
          breederName: b.breederName,
          pigeonScore: b.score,
          country: b.country,
          email: b.email,
          phoneNumber: b.phone,
          gender: b.gender,
          experienceLevel: b.experience,
          status: b.status ? "Verified" : "Not Verified",
        }));
        return {
          breeders,
          pagination: response?.data?.pagination || {},
        };
      },
      providesTags: (result) =>
        result?.breeders
          ? [
              ...result.breeders.map((b) => ({ type: "Breeder", id: b.key })),
              { type: "Breeder", id: "LIST" },
            ]
          : [{ type: "Breeder", id: "LIST" }],
    }),

    // ---------- ADD BREEDER ----------
    addBreeder: builder.mutation({
      query: ({ data, token }) => ({
        url: "/breeder",
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: [{ type: "Breeder", id: "LIST" }],
    }),

    // ---------- UPDATE BREEDER ----------
    updateBreeder: builder.mutation({
      query: ({ id, data, token }) => ({
        url: `/breeder/${id}`,
        method: "PUT",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Breeder", id },
        { type: "Breeder", id: "LIST" },
      ],
    }),

    // ---------- DELETE BREEDER ----------
    deleteBreeder: builder.mutation({
      query: (id) => ({
        url: `/breeder/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Breeder", id },
        { type: "Breeder", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBreedersQuery,
  useAddBreederMutation,
  useUpdateBreederMutation,
  useDeleteBreederMutation,
} = breederSlice;
