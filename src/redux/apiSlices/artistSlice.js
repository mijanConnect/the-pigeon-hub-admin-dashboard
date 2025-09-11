import { api } from "../api/baseApi";

const artistSlice = api.injectEndpoints({
    endpoints: (builder)=>({
        artists: builder.query({
            query: ({page, search})=> {
                const params = new URLSearchParams();
                if(page) params.append("page", page)
                if(search)params.append("search", search)
                return{
                    url: `/auth/get-all-artist?${params.toString()}`,
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
    useArtistsQuery
} = artistSlice;