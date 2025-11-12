import { configureStore } from '@reduxjs/toolkit'

import categoryApi from "./features/categories/categoryAPI"
import postApi from "./features/post/postAPI"
import userApi from "./features/users/userAPI"
import { uploadApi } from './features/upload/uploadApi';
import authApi from './features/auth/authApi';
import imagesApi from './features/image/imageAPI';
import footerApi from './features/footer/footerAPI';
// import chatApi from './features/chatbot/chatApi';

export const store = configureStore({
  reducer: {
    [categoryApi.reducerPath]: categoryApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [imagesApi.reducerPath]: imagesApi.reducer,
    [footerApi.reducerPath]: footerApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    // [chatApi.reducerPath]: chatApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      categoryApi.middleware,
      authApi.middleware,
      postApi.middleware,
      userApi.middleware,
      imagesApi.middleware,
      footerApi.middleware,
      uploadApi.middleware,
      // chatApi.middleware
    ),
});