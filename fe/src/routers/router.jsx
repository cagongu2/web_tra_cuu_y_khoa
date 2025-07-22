import React from "react";
import App from "../App";
import { createBrowserRouter } from "react-router-dom";
import { SearchPage } from "../pages/SearchPage";
import { SinglePost } from "../pages/SinglePost";
import { SearchList } from "../pages/SearchList";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <div>Home</div>,
      },
      {
        path: "/tra-cuu/:slug",
        element: <SearchPage />,
      },
      {
        path: "/tin-tuc/:slug",
        element: <SinglePost />,
      },
      {
        path: "/tra-cuu",
        element: <SearchList/>,
      },
    ],
  },
]);
export default router;
