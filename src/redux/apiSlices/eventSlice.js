import { api } from "../api/baseApi";


const eventSlice = api.injectEndpoints({
    endpoints: (builder)=>({
        createEvent: builder.mutation({
            query: (eventData)=> {
                return{
                    url: "/event/create-event",
                    method: "POST",
                    body: eventData,
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
        updateEvent: builder.mutation({
            query: ({ id, updatedData})=> {
                return{
                    url: `/event/update-event/${id}`,
                    method: "PATCH",
                    body: updatedData,
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
        deleteEvent: builder.mutation({
            query: (id)=> {
                return{
                    url: `/event/delete-event/${id}`,
                    method: "DELETE",
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
        events: builder.query({
            query: ()=> {
                return{
                    url: "/event/get-event",
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
    useCreateEventMutation,
    useUpdateEventMutation,
    useEventsQuery,
    useDeleteEventMutation
} = eventSlice;