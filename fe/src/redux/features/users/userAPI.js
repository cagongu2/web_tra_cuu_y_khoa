import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../util/baseUrl";

const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/users`,
    credentials: "include",
    prepareHeaders: (Headers) => {
        const token = localStorage.getItem("token");
        if (token) {
            Headers.set("Authorization", `Bearer ${token}`);
        }
        return Headers;
    },
});

const userApi = createApi({
    reducerPath: "userApi",
    baseQuery,
    tagTypes: ["Users"],
    endpoints: (builder) => ({
        getAllUsers: builder.query({
            query: () => ``,
            providesTags: ["Users"],
        }),

        getUserById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "Users", id }],
        }),

        getUserByUsername: builder.query({
            query: (username) => `/by-username/${username}`,
            providesTags: ["Users"],
        }),

        getUserByEmail: builder.query({
            query: (email) => `/by-email/${email}`,
            providesTags: ["Users"],
        }),

        existsByUsername: builder.query({
            query: (username) => `/exists/username/${username}`,
        }),

        existsByEmail: builder.query({
            query: (email) => `/exists/email/${email}`,
        }),

        createUser: builder.mutation({
            query: (data) => ({
                url: ``,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Users"],
        }),

        updateUser: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Users", id },
                "Users",
            ],
        }),
    }),
});

export const {
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useGetUserByUsernameQuery,
    useGetUserByEmailQuery,
    useExistsByUsernameQuery,
    useExistsByEmailQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
} = userApi;

export default userApi;
