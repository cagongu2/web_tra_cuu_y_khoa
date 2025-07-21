import React from 'react'
import App from "../App";
import { createBrowserRouter } from 'react-router-dom'
import { SearchPage } from '../pages/SearchPage';

const router = createBrowserRouter([  {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <div>Home</div>,
            },
            {
                path: "/tra-cuu/:slug",
                element: <SearchPage/>,
            },
            {
                path: "/orders",
                element: <div>Orders</div>
            },
            {
                path: "/about",
                element: <div>About</div>
            },

        ]
    }
]);
export default router;