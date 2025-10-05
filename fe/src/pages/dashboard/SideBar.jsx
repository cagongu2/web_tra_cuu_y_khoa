import {  useState } from "react";
import { FaChevronDown, FaHome, FaTimes } from "react-icons/fa";
import { GiNewspaper } from "react-icons/gi";
import { Link } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { IoNewspaperOutline } from "react-icons/io5";
import { CiViewList } from "react-icons/ci";

const Sidebar = ({ isSidebarOpen, toggleSidebar, activeMenu, setActiveMenu }) => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
    setActiveMenu(menu);
  };

  const handleClick = (menu) => {
    setActiveMenu(menu);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay cho mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative w-64 bg-white shadow-lg h-screen p-4 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo và nút đóng (mobile) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-indigo-600">
              <Link to="/">Youmed</Link>
            </span>
          </div>
          <button className="md:hidden text-gray-500" onClick={toggleSidebar}>
            <FaTimes size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <ul className="space-y-2 text-base text-gray-700 font-semibold">
          {/* home */}
          <li>
            <Link
              to="/"
              className={`flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-100 ${
                activeMenu === "dashboard" ? "bg-purple-100 text-blue-500" : ""
              }`}
              onClick={() => handleClick("dashboard")}
            >
              <div className="flex items-center">
                <FaHome />
                <span className="ml-2">Trang Chủ</span>
              </div>
            </Link>
          </li>

          {/* Posts */}
          <li>
            <button
              onClick={() => toggleMenu("posts")}
              className={`flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-100 ${
                activeMenu === "posts" ? "bg-purple-100 text-blue-500" : ""
              }`}
            >
              <div className="flex items-center">
                <GiNewspaper />
                <span className="ml-2">Bài Viết</span>
              </div>
              <FaChevronDown
                className={`font-light transition ${
                  openMenus["posts"] ? "rotate-180" : ""
                }`}
                size={12}
              />
            </button>
            {openMenus["posts"] && (
              <ul className="ml-4 mt-1 space-y-1 text-gray-600 text-sm">
                <li
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    activeMenu === "activePostList"
                      ? "bg-purple-100 text-blue-500"
                      : ""
                  }`}
                  onClick={() => handleClick("activePostList")}
                >
                  Danh Sách Bài Viết
                </li>
                {/* <li
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    activeMenu === "inActivePostList"
                      ? "bg-purple-100 text-blue-500"
                      : ""
                  }`}
                  onClick={() => handleClick("inActivePostList")}
                >
                  Danh Sách Ẩn
                </li> */}
              </ul>
            )}
          </li>

          {/* Categories */}
          <li>
            <button
              onClick={() => toggleMenu("categories")}
              className={`flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-100 ${
                activeMenu === "categories" ? "bg-purple-100 text-blue-500" : ""
              }`}
            >
              <div className="flex items-center">
                <CiViewList />
                <span className="ml-2">Danh mục</span>
              </div>
              <FaChevronDown
                className={`font-light transition ${
                  openMenus["categories"] ? "rotate-180" : ""
                }`}
                size={12}
              />
            </button>
            {openMenus["categories"] && (
              <ul className="ml-4 mt-1 space-y-1 text-gray-600 text-sm">
                <li
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    activeMenu === "activeCategoryList"
                      ? "bg-purple-100 text-blue-500"
                      : ""
                  }`}
                  onClick={() => handleClick("activeCategoryList")}
                >
                  Danh sách danh mục
                </li>
                {/* <li
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    activeMenu === "inactiveCategoryList"
                      ? "bg-purple-100 text-blue-500"
                      : ""
                  }`}
                  onClick={() => handleClick("inactiveCategoryList")}
                >
                  Danh sách danh mục bị ẩn
                </li> */}
              </ul>
            )}
          </li>

          {/* Users */}
          <li>
            <button
              onClick={() => toggleMenu("users")}
              className={`flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-100 ${
                activeMenu === "users" ? "bg-purple-100 text-blue-500" : ""
              }`}
            >
              <div className="flex items-center">
                <FaRegUser />
                <span className="ml-2">Người dùng</span>
              </div>
              <FaChevronDown
                className={`font-light transition ${
                  openMenus["users"] ? "rotate-180" : ""
                }`}
                size={12}
              />
            </button>
            {openMenus["users"] && (
              <ul className="ml-4 mt-1 space-y-1 text-gray-600 text-sm">
                <li
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    activeMenu === "userList"
                      ? "bg-purple-100 text-blue-500"
                      : ""
                  }`}
                  onClick={() => handleClick("userList")}
                >
                  Danh sách người dùng
                </li>
                {/* <li
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    activeMenu === "addUser"
                      ? "bg-purple-100 text-blue-500"
                      : ""
                  }`}
                  onClick={() => handleClick("addUser")}
                >
                  Thêm người dùng
                </li> */}
              </ul>
            )}
          </li>

          {/* CompanyInfo */}
          <li>
            <button
              onClick={() => toggleMenu("companyInfo")}
              className={`flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-100 ${
                activeMenu === "companyInfo"
                  ? "bg-purple-100 text-blue-500"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <IoNewspaperOutline />
                <span className="ml-2">Thông Tin Công Ty</span>
              </div>
              <FaChevronDown
                className={`font-light transition ${
                  openMenus["companyInfo"] ? "rotate-180" : ""
                }`}
                size={12}
              />
            </button>
            {openMenus["companyInfo"] && (
              <ul className="ml-4 mt-1 space-y-1 text-gray-600 text-sm">
                <li
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    activeMenu === "banner" ? "bg-purple-100 text-blue-500" : ""
                  }`}
                  onClick={() => handleClick("banner")}
                >
                  Banner
                </li>
                <li
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    activeMenu === "logo" ? "bg-purple-100 text-blue-500" : ""
                  }`}
                  onClick={() => handleClick("logo")}
                >
                  Logo
                </li>
                <li
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    activeMenu === "favicon"
                      ? "bg-purple-100 text-blue-500"
                      : ""
                  }`}
                  onClick={() => handleClick("favicon")}
                >
                  Favicon
                </li>
                <li
                  className={`p-2 rounded-lg hover:bg-gray-100 ${
                    activeMenu === "footer" ? "bg-purple-100 text-blue-500" : ""
                  }`}
                  onClick={() => handleClick("footer")}
                >
                  Footer
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
