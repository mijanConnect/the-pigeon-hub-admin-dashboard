// src/redux/allPigeonSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api/baseApi";

export const pigeonsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllPigeons: builder.query({
      query: ({ page = 1, limit = 100 }) =>
        `/pigeon?page=${page}&limit=${limit}`,
    }),

    updatePigeon: builder.mutation({
      query: ({ id, data }) => ({
        url: `/pigeon/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    deletePigeon: builder.mutation({
      query: (id) => ({
        url: `/pigeon/${id}`,
        method: "DELETE",
        body: { id }, // send ID in body
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllPigeonsQuery,
  useUpdatePigeonMutation,
  useDeletePigeonMutation,
} = pigeonsApi;
