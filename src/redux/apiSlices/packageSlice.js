// src/redux/packageSlice.js
import { api } from "../api/baseApi"; // Ensure this is your RTK Query base API

export const packageSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all packages
    getPackages: builder.query({
      query: () => "/package",
      transformResponse: (response) => {
        return response?.data?.map((pkg) => ({
          id: pkg._id,
          title: pkg.title,
          description: pkg.description,
          price: pkg.price,
          duration: pkg.duration,
          features: pkg.features,
          active: pkg.status === "Active",
          paymentLink: pkg.paymentLink || "",
        }));
      },
      providesTags: ["Packages"],
    }),

    // Add a new package
    addPackage: builder.mutation({
      query: (formData) => ({
        url: "/package",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Packages"],
    }),

    // Update a package
    updatePackage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/package/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Packages"],
    }),

    // Delete a package
    deletePackage: builder.mutation({
      query: (id) => ({
        url: `/package/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Packages"],
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useAddPackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packageSlice;
