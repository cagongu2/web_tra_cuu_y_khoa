import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../util/baseUrl";

const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/authenticate`,
    credentials: 'include',
    prepareHeaders: (Headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            Headers.set('Authorization', `Bearer ${token}`);
        }
        return Headers;
    }
})

const authApi = createApi({
    reducerPath: "authApi",
    baseQuery,
    tagTypes: ["Auth"],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "",
                method: "POST",
                body: credentials,
            }),
            transformResponse: (response) => {
                if (response && response.accessToken) {
                    localStorage.setItem("token", response.accessToken);
                    localStorage.setItem("userId", response.user.id);
                    localStorage.setItem("username", response.user.username);

                }
                return response;
            },
            invalidatesTags: ["Auth"],
        }),
        logout: builder.mutation({
            query: (data) => ({
                url: "/logout",
                method: "POST",
                body: data,
            }),
            transformResponse: () => {
                localStorage.removeItem("token");
            },
            invalidatesTags: ["Auth"],
        }),

    })
})

export const {
    useLoginMutation,
    useLogoutMutation } = authApi;
export default authApi;