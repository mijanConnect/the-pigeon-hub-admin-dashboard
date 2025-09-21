// src/redux/apiSlices/termsAndConditionSlice.js
import { api } from "../api/baseApi";

const termsAndConditionSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET Terms & Conditions
    getTermsAndConditions: builder.query({
      query: () => ({
        url: "/rule/terms-and-conditions",
        method: "GET",
      }),
      transformResponse: (response) => response.data, // return data object
      providesTags: ["TermsAndConditions"],
    }),

    // POST / update Terms & Conditions
    updateTermsAndConditions: builder.mutation({
      query: (content) => ({
        url: "/rule/terms-and-conditions",
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["TermsAndConditions"], // refresh after update
    }),
  }),
});

export const {
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
} = termsAndConditionSlice;
