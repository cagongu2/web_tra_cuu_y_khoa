import { configureStore } from '@reduxjs/toolkit'

import categoryApi from "./features/categories/categoryAPI"
import postApi from "./features/post/postAPI"
import userApi from "./features/users/userAPI"

export const store = configureStore({
  reducer: {
    [categoryApi.reducerPath]: categoryApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      categoryApi.middleware,
      postApi.middleware,
      userApi.middleware
    ),
});