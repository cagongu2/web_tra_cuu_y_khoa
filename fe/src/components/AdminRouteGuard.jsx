import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hook/useAuth";

const AdminRouteGuard = ({ allowedRoles = ["admin"] }) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mt-4 md:mt-10 mx-2 md:mx-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAuthorized = allowedRoles.some((role) => hasRole(role));

  if (isAuthorized) {
    return <Outlet />;
  } else {
    // Chuyển hướng đến trang báo lỗi (ví dụ: 403 Forbidden)
    // Nếu không có trang 403, có thể chuyển hướng về trang chủ
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
};

export default AdminRouteGuard;
