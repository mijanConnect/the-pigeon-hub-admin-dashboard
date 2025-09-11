import { api } from "../api/baseApi";

const mypigeonSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ---------- GET ----------
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
        const pigeons = response?.data?.data?.map((pigeon) => ({
          key: pigeon._id,
          image: pigeon.photos?.[0] || "",
          name: pigeon.name,
          country: { name: pigeon.country, icon: "" },
          breeder: pigeon.breeder,
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
        return { pigeons, pagination: response?.data?.pagination || {} };
      },
      providesTags: (result) =>
        result?.pigeons
          ? [
              ...result.pigeons.map((p) => ({ type: "Pigeon", id: p.key })),
              { type: "Pigeon", id: "LIST" },
            ]
          : [{ type: "Pigeon", id: "LIST" }],
    }),

    // ---------- POST ----------
    addPigeon: builder.mutation({
      query: ({ data, imageFile, token }) => {
        const formData = new FormData();

        // Append JSON fields as 'data'
        formData.append("data", JSON.stringify(data));

        // Append image file
        if (imageFile) {
          formData.append("image", imageFile);
        }

        return {
          url: "/pigeon",
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`, // Include auth token
          },
        };
      },
      invalidatesTags: [{ type: "Pigeon", id: "LIST" }],
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
  }),
});

export const {
  useGetMyPigeonsQuery,
  useAddPigeonMutation,
  useDeletePigeonMutation,
} = mypigeonSlice;
