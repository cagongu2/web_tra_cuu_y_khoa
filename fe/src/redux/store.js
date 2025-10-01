import { configureStore } from '@reduxjs/toolkit'

import categoryApi from "./features/categories/categoryAPI"
import postApi from "./features/post/postAPI"
import userApi from "./features/users/userAPI"
import { uploadApi } from './features/upload/uploadApi';
import authApi from './features/auth/authApi';

export const store = configureStore({
  reducer: {
    [categoryApi.reducerPath]: categoryApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      categoryApi.middleware,
      authApi.middleware,
      postApi.middleware,
      userApi.middleware,
      uploadApi.middleware
    ),
});