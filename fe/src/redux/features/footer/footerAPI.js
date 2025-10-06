import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../util/baseUrl";

const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/footers`,
    credentials: "include",
    prepareHeaders: (headers) => {
        const token = localStorage.getItem("token");
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

const footerApi = createApi({
    reducerPath: "footerApi",
    baseQuery,
    tagTypes: ["Footers"],
    endpoints: (builder) => ({
        getAllFooters: builder.query({
            query: () => ``,
            providesTags: ["Footers"],
        }),

        getFooterById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "Footers", id }],
        }),

        getFootersByStatus: builder.query({
            query: (isActive) => `/status?isActive=${isActive}`,
            providesTags: ["Footers"],
        }),

        getActiveFooter: builder.query({
            query: () => `/active`,
            providesTags: ["Footers"],
        }),

        createFooter: builder.mutation({
            query: (data) => ({
                url: ``,
                method: "POST",
                body: data,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: ["Footers"],
        }),

        updateFooter: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Footers", id },
                "Footers",
            ],
        }),

        deleteFooter: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Footers"],
        }),
    }),
});

export const {
    useGetAllFootersQuery,
    useGetFooterByIdQuery,
    useGetFootersByStatusQuery,
    useGetActiveFooterQuery,
    useCreateFooterMutation,
    useUpdateFooterMutation,
    useDeleteFooterMutation,
} = footerApi;

export default footerApi;