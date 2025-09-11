import { api } from "../api/baseApi";

const homeSlice = api.injectEndpoints({
    endpoints: (builder)=>({
        summary: builder.query({
            query: ()=> {
                return{
                    url: `/order`,
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
    useSummaryQuery
} = homeSlice;