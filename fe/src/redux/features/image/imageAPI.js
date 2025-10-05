import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../util/baseUrl";

const baseQuery = fetchBaseQuery({
    baseUrl: `${getBaseUrl()}/api/images`,
    credentials: 'include',
    prepareHeaders: (Headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            Headers.set('Authorization', `Bearer ${token}`);
        }
        return Headers;
    },
});

const imagesApi = createApi({
    reducerPath: "imagesApi",
    baseQuery,
    tagTypes: ["Images"],
    endpoints: (builder) => ({

        getImageByType: builder.query({
            query: (type) => `/${type}`,
            providesTags: ["Images"],
        }),

        uploadImage: builder.mutation({
            query: ({ type, file }) => {
                const formData = new FormData();
                formData.append("file", file);

                return {
                    url: `/${type}`,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { type }) => [
                { type: "Images", id: type },
                "Images",
            ],
        }),
    }),
});

export const {
    useGetImageByTypeQuery,
    useUploadImageMutation,
} = imagesApi;

export default imagesApi;
