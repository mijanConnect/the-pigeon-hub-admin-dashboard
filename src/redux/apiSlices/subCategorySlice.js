import { api } from "../api/baseApi";


const subCategorySlice = api.injectEndpoints({
    endpoints: (builder)=>({
        createSubCategory: builder.mutation({
            query: (categoryData)=> {
                return{
                    url: "/subCategory/create-sub-category",
                    method: "POST",
                    body: categoryData,
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
        updateSubCategory: builder.mutation({
            query: ({ id, updatedData})=> {
                return{
                    url: `/subCategory/${id}`,
                    method: "PATCH",
                    body: updatedData,
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
        deleteSubCategory: builder.mutation({
            query: (id)=> {
                return{
                    url: `/subCategory/${id}`,
                    method: "DELETE",
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
        getSubCategories: builder.query({
            query: ()=> {
                return{
                    url: "/subCategory",
                    method: "GET",
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
    })
})

export const {
    useGetSubCategoriesQuery,
    useCreateSubCategoryMutation,
    useUpdateSubCategoryMutation,
    useDeleteSubCategoryMutation
} = subCategorySlice;