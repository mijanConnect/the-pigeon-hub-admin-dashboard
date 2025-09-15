import { api } from "../api/baseApi";

const breederSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getBreeders: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search,
        country,
        gender,
        status,
        experience,
      }) => {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", limit);
        if (search) params.append("search", search);
        if (country && country !== "all") params.append("country", country);
        if (gender && gender !== "all") params.append("gender", gender);
        if (status !== undefined && status !== "all")
          params.append("status", status === "Active" ? true : false);
        if (experience && experience !== "all")
          params.append("experience", experience);

        return {
          url: `/breeder?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        const breeders = response?.data?.breeder?.map((b) => ({
          _id: b._id,
          breederName: b.breederName,
          loftName: b.loftName,
          pigeonScore: b.score,
          country: b.country,
          email: b.email,
          phoneNumber: b.phone,
          gender: b.gender,
          experienceLevel: b.experience,
          status: b.status,
        }));
        return {
          breeders,
          pagination: response?.data?.pagination || {},
        };
      },
      providesTags: (result) =>
        result?.breeders
          ? [
              ...result.breeders.map((b) => ({ type: "Breeder", id: b._id })),
              { type: "Breeder", id: "LIST" },
            ]
          : [{ type: "Breeder", id: "LIST" }],
    }),
    addBreeder: builder.mutation({
      query: ({ data, token }) => ({
        url: "/breeder",
        method: "POST",
        body: data,
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: [{ type: "Breeder", id: "LIST" }],
    }),
    updateBreeder: builder.mutation({
      query: ({ id, data, token }) => ({
        url: `/breeder/${id}`,
        method: "PATCH",
        body: data,
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Breeder", id },
        { type: "Breeder", id: "LIST" },
      ],
    }),
    deleteBreeder: builder.mutation({
      query: (id) => ({ url: `/breeder/${id}`, method: "DELETE" }),
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
