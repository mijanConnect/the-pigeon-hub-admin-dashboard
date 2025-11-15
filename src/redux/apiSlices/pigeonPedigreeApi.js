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

      // Provide an item-level tag so invalidations can target specific pedigree entries
      providesTags: (result, error, id) =>
        result ? [{ type: "Pedigree", id }] : [{ type: "Pedigree", id }],
    }),
  }),
});

export const { useGetPigeonPedigreeDataQuery } = pigeonPedigreeApi;
