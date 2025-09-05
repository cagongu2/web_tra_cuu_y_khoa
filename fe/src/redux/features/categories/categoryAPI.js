import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../util/baseUrl";

const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/categories`,
    credentials: 'include',
    prepareHeaders: (Headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            Headers.set('Authorization', `Bearer ${token}`);
        }
        return Headers;
    }
})

const categoriesApi = createApi({
    reducerPath: 'categoriesApi',
    baseQuery,
    tagTypes: ['Categories'],
    endpoints: (builder) => ({
        getAllCategories: builder.query({
            query: (level) => `?level=${level}`,
            providesTags: ['Categories']
        }),

        getCategoryById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: 'Categories', id }]
        }),

        getCategoryBySlug: builder.query({
            query: (slug) => `/slug/${slug}`,
            providesTags: ['Categories']
        }),

        getChildren: builder.query({
            query: (parentId) => `/children/${parentId}`,
            providesTags: ['Categories']
        }),

        createCategory: builder.mutation({
            query: (data) => ({
                url: ``,
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Categories']
        }),

        updateCategory: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Categories', id },
                'Categories'
            ]
        }),

        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Categories', id },
                'Categories'
            ]
        })

    })
})

export const {
    useGetAllCategoriesQuery,
    useGetCategoryByIdQuery,
    useGetCategoryBySlugQuery,
    useGetChildrenQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation } = categoriesApi;
export default categoriesApi;