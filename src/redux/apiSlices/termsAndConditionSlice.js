import { api } from "../api/baseApi";


const termsAndConditionSlice = api.injectEndpoints({
    endpoints: (builder)=>({
        updateTermsAndConditions: builder.mutation({
            query: ({id, description})=> {
                return{
                    url: `/terms-and-condition/update-terms-and-condition/${id}`,
                    method: "PATCH",
                    body: {description},
                    headers:{
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`
                    }
                }
            }
        }),
        termsAndCondition: builder.query({
            query: ()=> {
                return{
                    url: "/terms-and-condition/get-terms-and-condition",
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
    })
})

export const {
    useTermsAndConditionQuery,
    useUpdateTermsAndConditionsMutation
} = termsAndConditionSlice;