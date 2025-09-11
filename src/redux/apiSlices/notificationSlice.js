import { api } from "../api/baseApi";

const notificationSlice = api.injectEndpoints({
    endpoints: (builder)=>({
        notification: builder.query({
            query: ()=> {
                return{
                    url: `/notifications`,
                    method: "GET",
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
        read: builder.mutation({
            query: ()=> {
                return{
                    url: `/notifications`,
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
    useNotificationQuery,
    useReadMutation
} = notificationSlice;