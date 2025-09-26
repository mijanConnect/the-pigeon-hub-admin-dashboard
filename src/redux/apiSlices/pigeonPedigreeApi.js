import { api } from "../api/baseApi";

export const pigeonPedigreeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPigeonPedigreeData: builder.query({
      query: (id) => {
        return {
          url: `/pigeon/family/${id}`,
          method: "GET",
        };
      },

      providesTags: ["Profile"],
    }),
  }),
});

export const { useGetPigeonPedigreeDataQuery } = pigeonPedigreeApi;
