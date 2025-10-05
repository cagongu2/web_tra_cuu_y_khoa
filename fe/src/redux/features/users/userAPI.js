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
            query: (data) => {
                const formData = new FormData();
                if (data.username !== undefined) formData.append("username", data.username ?? "");
                if (data.email !== undefined) formData.append("email", data.email ?? "");
                if (data.password !== undefined) formData.append("password", data.password ?? "");
                if (data.phone !== undefined) formData.append("phone", data.phone ?? "");
                if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
                if (data.file instanceof File) formData.append("file", data.file);
                return {
                    url: ``,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Users"],
        }),

        updateUser: builder.mutation({
            query: ({ id, ...data }) => {
                const formData = new FormData();
                if (data.username !== undefined) formData.append("username", data.username ?? "");
                if (data.email !== undefined) formData.append("email", data.email ?? "");
                if (data.password !== undefined) formData.append("password", data.password ?? "");
                if (data.phone !== undefined) formData.append("phone", data.phone ?? "");
                if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
                if (data.file instanceof File) formData.append("file", data.file);

                return {
                    url: `/${id}`,
                    method: "PUT",
                    body: formData,
                };
            },
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
