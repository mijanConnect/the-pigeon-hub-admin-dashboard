import { api } from "../api/baseApi";


const bannerSlice = api.injectEndpoints({
    endpoints: (builder)=>({
        createBanner: builder.mutation({
            query: (bannerData)=> {
                return{
                    url: "/banner/create-banner",
                    method: "POST",
                    body: bannerData,
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
        deleteBanner: builder.mutation({
            query: (id)=> {
                return{
                    url: `/banner/delete-banner/${id}`,
                    method: "DELETE",
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
        banners: builder.query({
            query: ()=> {
                return{
                    url: "/banner/get-banner",
                    method: "GET",
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            },
            transformResponse: ({data})=>{
                return data
            }
        }),
        updateStatus: builder.mutation({
            query: (id)=> {
                return{
                    url: `/banner/${id}`,
                    method: "PATCH",
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
    })
})

export const {
    useCreateBannerMutation,
    useDeleteBannerMutation,
    useBannersQuery,
    useUpdateStatusMutation
} = bannerSlice;