import { api } from "../api/baseApi";

const earningSlice = api.injectEndpoints({
    endpoints: (builder)=>({
        earnings: builder.query({
            query: ({page, search})=> {
                const params = new URLSearchParams();
                if(page) params.append("page", page)
                if(search)params.append("search", search)
                return{
                    url: `/order/earning-history`,
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
    useEarningsQuery
} = earningSlice;