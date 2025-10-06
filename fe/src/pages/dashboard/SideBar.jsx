import { useState } from "react";
import { FaChevronDown, FaHome, FaTimes } from "react-icons/fa";
import { GiNewspaper } from "react-icons/gi";
import { Link } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { IoNewspaperOutline } from "react-icons/io5";
import { CiViewList } from "react-icons/ci";
import { useGetImageByTypeQuery } from "../../redux/features/image/imageAPI";
import { getImgUrl } from "../../util/getImgUrl";

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  activeMenu,
  setActiveMenu,
}) => {
  const [openMenus, setOpenMenus] = useState({});
  const { data: logo } = useGetImageByTypeQuery("logo");

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleClick = (menu) => {
    setActiveMenu(menu);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Trang Chủ",
      icon: <FaHome />,
      path: "/",
    },
    {
      id: "posts",
      label: "Bài Viết",
      icon: <GiNewspaper />,
      submenus: [{ id: "activePostList", label: "Danh Sách Bài Viết" }],
    },
    {
      id: "categories",
      label: "Danh mục",
      icon: <CiViewList />,
      submenus: [{ id: "activeCategoryList", label: "Danh sách danh mục" }],
    },
    {
      id: "users",
      label: "Người dùng",
      icon: <FaRegUser />,
      submenus: [{ id: "userList", label: "Danh sách người dùng" }],
    },
    {
      id: "companyInfo",
      label: "Thông Tin Công Ty",
      icon: <IoNewspaperOutline />,
      submenus: [
        { id: "banner", label: "Banner" },
        { id: "logo", label: "Logo" },
        { id: "favicon", label: "Favicon" },
        { id: "footer", label: "Footer" },
      ],
    },
  ];

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
        className={`fixed md:relative w-64 bg-white h-screen p-4 z-50 transform transition-transform duration-300 ease-in-out border-r border-gray-200 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo và nút đóng (mobile) */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-800">
              <Link to="/">
                <img
                  src={getImgUrl(logo?.url)}
                  alt=""
                  className="!m-0 w-[174px] h-[84px] object-cover"
                />
              </Link>
            </span>
          </div>
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={toggleSidebar}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.id} className="mb-1">
              {item.path ? (
                // Menu item có đường dẫn
                <Link
                  to={item.path}
                  className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleClick(item.id)}
                >
                  <div
                    className={`${
                      activeMenu === item.id ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="ml-3 font-medium">{item.label}</span>
                </Link>
              ) : (
                // Menu item có submenu
                <>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`flex justify-between items-center w-full p-3 rounded-lg transition-colors ${
                      activeMenu === item.id
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`${
                          activeMenu === item.id
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="ml-3 font-medium">{item.label}</span>
                    </div>
                    <FaChevronDown
                      className={`transition-transform duration-200 ${
                        openMenus[item.id] ? "rotate-180" : ""
                      } ${
                        activeMenu === item.id
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                      size={12}
                    />
                  </button>

                  {/* Submenu */}
                  {openMenus[item.id] && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenus.map((submenu) => (
                        <button
                          key={submenu.id}
                          className={`flex items-center w-full p-2 rounded-lg transition-colors text-left ${
                            activeMenu === submenu.id
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          }`}
                          onClick={() => handleClick(submenu.id)}
                        >
                          <span className="text-sm ml-7">{submenu.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
