import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./SideBar";
import PostList from "./Post/PostList";
import { FaBars } from "react-icons/fa";
import CategoryList from "./category/CategoryList";
import UserList from "./User/UserList";

const DashBoard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Header cho mobile */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between md:hidden">
        <button className="text-gray-600" onClick={toggleSidebar}>
          <FaBars size={20} />
        </button>
        <span className="text-xl font-bold text-indigo-600">Youmed</span>
        <div className="w-6"></div> {/* Placeholder để cân bằng layout */}
      </div>

      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        {activeMenu === "activePostList" && <PostList />}
        {activeMenu === "activeCategoryList" && <CategoryList />}
        {activeMenu === "userList" && <UserList />}
        {activeMenu === "dashboard" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Chào mừng đến với Dashboard
            </h1>
            <p className="text-gray-600">Chọn một mục từ menu để bắt đầu.</p>
          </div>
        )}
        {activeMenu === "inActivePostList" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">Danh sách bài viết ẩn</h2>
            {/* Component render bài viết ẩn */}
          </div>
        )}
        {activeMenu === "inactiveCategoryList" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">Danh sách danh mục</h2>
            {/* Component render danh mục */}
          </div>
        )}
        {activeMenu === "inactiveUserList" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">Danh sách người dùng</h2>
            {/* Component render danh mục */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
