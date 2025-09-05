import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../util/baseUrl";

const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/posts`,
    credentials: "include",
    prepareHeaders: (Headers) => {
        const token = localStorage.getItem("token");
        if (token) {
            Headers.set("Authorization", `Bearer ${token}`);
        }
        return Headers;
    },
});

const postApi = createApi({
    reducerPath: "postApi",
    baseQuery,
    tagTypes: ["Posts"],
    endpoints: (builder) => ({
        getAllPosts: builder.query({
            query: () => ``,
            providesTags: ["Posts"],
        }),

        getPostById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "Posts", id }],
        }),

        getPostBySlug: builder.query({
            query: (slug) => `/slug/${slug}`,
            providesTags: ["Posts"],
        }), 

        getPostsByCategory: builder.query({
            query: (categoryId) => `/category/${categoryId}`,
            providesTags: ["Posts"],
        }),

        getPostsByAuthor: builder.query({
            query: (authorId) => `/author/${authorId}`,
            providesTags: ["Posts"],
        }),

        getPostsByStatus: builder.query({
            query: (status) => `/status/${status}`,
            providesTags: ["Posts"],
        }),

        createPost: builder.mutation({
            query: (data) => ({
                url: ``,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Posts"],
        }),

        updatePost: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Posts", id },
                "Posts",
            ],
        }),

        deletePost: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Posts", id },
                "Posts",
            ],
        }),
    }),
});

export const {
    useGetAllPostsQuery,
    useGetPostByIdQuery,
    useGetPostBySlugQuery,
    useGetPostsByCategoryQuery,
    useGetPostsByAuthorQuery,
    useGetPostsByStatusQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
} = postApi;

export default postApi;
