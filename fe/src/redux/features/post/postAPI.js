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
            query: ({ page = 0, size = 10 }) =>
                `?page=${page}&size=${size}`,
        }),

        searchPostsByTitleIslikeIgnoreCase: builder.query({
            query: ({ keyword, page = 0, size = 10 }) =>
                `/search?keyword=${keyword}&page=${page}&size=${size}`,
        }),

        searchPost: builder.query({
            query: (query) => `/search-post?query=${query}`,
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
            query: (data) => {
                const formData = new FormData();

                if (data.name) formData.append("name", data.name);
                if (data.title) formData.append("title", data.title);
                if (data.slug) formData.append("slug", data.slug);
                if (data.status) formData.append("status", data.status);
                if (data.categoryId) formData.append("categoryId", data.categoryId);
                if (data.authorId) formData.append("authorId", data.authorId);
                if (data.content) formData.append("content", data.content);
                if (data.file && data.file.length > 0) {
                    formData.append("file", data.file[0]);
                }

                return {
                    url: ``,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Posts"],
        }),


        updatePost: builder.mutation({
            query: ({ id, ...data }) => {
                const formData = new FormData();

                if (data.name) formData.append("name", data.name);
                if (data.title) formData.append("title", data.title);
                if (data.slug) formData.append("slug", data.slug);
                if (data.status) formData.append("status", data.status);
                if (data.categoryId) formData.append("categoryId", data.categoryId);
                if (data.authorId) formData.append("authorId", data.authorId);
                if (data.content) formData.append("content", data.content);
                if (data.file && data.file.length > 0) formData.append("file", data.file[0]);

                return {
                    url: `/${id}`,
                    method: "PUT",
                    body: formData,
                };
            },
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
    useSearchPostsByTitleIslikeIgnoreCaseQuery,
    useSearchPostQuery,
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
