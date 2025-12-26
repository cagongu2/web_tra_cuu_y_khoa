import React from "react";
import App from "../App";
import { createBrowserRouter } from "react-router-dom";
import { SearchPage } from "../pages/SearchPage";
import { SinglePost } from "../pages/SinglePost";
import { SearchList } from "../pages/SearchList";
import DashBoard from "../pages/dashboard/Dashboard";
import Login from "../components/Login";
import Register from "../components/Register";
import AdminRouteGuard from "../components/AdminRouteGuard";
import { ChatSimulator } from "../components/ChatSimulator";
import { Home } from "../pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home/>,
      },
      {
        path: "/tra-cuu/:slug",
        element: <SearchPage />,
      },
      {
        path: "/tra-cuu/tat-ca-thong-tin",
        element: <SearchPage />,
      },
      {
        path: "/tin-tuc/:slug",
        element: <SinglePost />,
      },
      {
        path: "/tra-cuu",
        element: <SearchList />,
      },
    ],
  },
  {
    path: "/hoi-dap",
    element: <ChatSimulator />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    element: <AdminRouteGuard allowedRoles={["admin"]} />,
    children: [
      // admin router
      {
        path: "/dashboard",
        element: <DashBoard />,
      },
    ],
  },
]);
export default router;
