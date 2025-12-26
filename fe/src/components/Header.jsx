import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { useGetAllCategoriesQuery } from "../redux/features/categories/categoryAPI";
import { FaAngleDown } from "react-icons/fa";
import { getImgUrl } from "../util/getImgUrl";
import { useGetImageByTypeQuery } from "../redux/features/image/imageAPI";
import useAuth from "../hook/useAuth";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const {
    data: categories,
    error,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery(0);
  const { isAdmin, isLoading } = useAuth();

  const username = localStorage.getItem("username");
  const avatar_url = localStorage.getItem("avatar_url");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      setActiveCategory(null);
      setActiveSubCategory(null);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
    setActiveSubCategory(null);
  };

  const handleSubCategoryClick = (subCategoryId) => {
    setActiveSubCategory(
      activeSubCategory === subCategoryId ? null : subCategoryId
    );
  };

  const [isSubItemOpen, setIsSubItemOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleMenu = () => {
    setIsSubItemOpen(!isSubItemOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("avatar_url");
    setIsMenuOpen(false);
    navigate("/login");
  };

  const { data: logo } = useGetImageByTypeQuery("logo");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const searchQuery = data["search-title"]?.trim();

    if (searchQuery) {
      navigate(`/tra-cuu?s=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="mt-4 md:mt-10 mx-2 md:mx-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 md:mt-10 mx-2 md:mx-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white shadow-sm w-full mb-10">
        {/* Phần trên cùng với logo, hamburger và search */}
        <div className="max-w-[1130px] my-0 mx-auto flex justify-between items-center py-2 px-4">
          <div className="flex items-center">
            <div className="lg:hidden flex justify-center mr-2">
              <button
                className="text-blue-600 cursor-pointer"
                onClick={toggleMenu}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
            <img
              src={getImgUrl(logo?.url)}
              alt=""
              className="!m-0 w-auto h-[100px] object-contain object-center mx-auto"
            />
            {/* <h1 className="text-2xl font-bold text-blue-600">YouMed</h1> */}
          </div>
          <div className="flex">
            <form className="relative w-100 " onSubmit={handleSubmit(onSubmit)}>
              <input
                type="text"
                {...register("search-title", { required: true })}
                placeholder="Tìm kiếm bài viết, thông tin bệnh, thuốc ..."
                name="search-title"
                id="search-title"
                className="w-full py-3 px-6 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="absolute right-3 top-4 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>

            {/* info */}
            <div className="flex items-center pl-5">
              <div>
                {!username ? (
                  // Nếu chưa login
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
                  >
                    Đăng nhập
                  </button>
                ) : (
                  // Nếu đã login
                  <div className="relative">
                    <button
                      onClick={handleToggleMenu}
                      className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      {/* user avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                        <img
                          className="w-full h-full object-cover"
                          style={{ margin: 0 }}
                          src={getImgUrl(avatar_url)}
                          alt="avatar"
                        />
                      </div>

                      {/* user name */}
                      <span className="font-medium text-gray-700 max-w-32 truncate">
                        {username}
                      </span>

                      {/* down icon */}
                      <FaAngleDown
                        className={`text-gray-500 transition-transform duration-200 ${
                          isSubItemOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown menu */}
                    {isSubItemOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 font-medium"
                        >
                          Đăng xuất
                        </button>

                        {isAdmin() && (
                          <Link to="/dashboard">
                            <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 font-medium">
                              Bảng điều khiển
                            </button>
                          </Link>
                        )}

                        <Link to="/hoi-dap">
                          <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 font-medium">
                            Hỏi đáp với AI{" "}
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block border-1 border-gray-100"></div>
        <div className="hidden lg:block max-w-[1130px] my-0 mx-auto">
          {/* Menu chính */}
          <nav className="">
            <ul className="flex space-x-5 text-sm font-semibold items-center py-2 px-4 gap-4">
              <li className="relative">
                <a href="#" className="text-black hover:text-blue-600">
                  <GoHomeFill />
                </a>
              </li>

              {!isLoading &&
                categories &&
                categories.length > 0 &&
                categories.slice(0, 5).map((category) => (
                  <li key={category.id} className="group">
                    <div
                      onMouseEnter={() => setActiveCategory(category.id)}
                      onMouseLeave={() => setActiveCategory(null)}
                    >
                      {/* Thẻ cha: có group-hover */}
                      <a
                        href={`/tra-cuu/${category.slug}`}
                        className="text-black group-hover:text-blue-600 py-2 block"
                      >
                        {category.name}
                      </a>

                      {/* Dropdown menu con */}
                      {activeCategory === category.id && (
                        <div className="absolute left-0 w-screen flex justify-center">
                          <div className="w-[1130px] max-w-[1130px] bg-white shadow-lg z-50 p-4">
                            <div className="flex border-t border-gray-200 p-4">
                              {/* Cấp 2: không có cấp 1 */}
                              {category.children &&
                                !category.children.some(
                                  (child) => child.level === 1
                                ) && (
                                  <div className="w-full">
                                    <ul className="grid grid-cols-1 gap-2">
                                      {category.postList
                                        ?.slice(0, 7)
                                        .map((post) => (
                                          <li
                                            key={post.id}
                                            className="group/child"
                                          >
                                            <a
                                              href={`/tin-tuc/${post.slug}`}
                                              className="block py-1 text-gray-700 group-hover/child:text-blue-600"
                                            >
                                              {post.name}
                                            </a>
                                          </li>
                                        ))}
                                      {category.postList?.length > 7 && (
                                        <li>
                                          <a
                                            href={`/tra-cuu/${category.slug}`}
                                            className="block py-1 text-blue-600 font-semibold"
                                          >
                                            Tra cứu thêm
                                          </a>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {/* Cấp 1 và cấp 2 */}
                              {category.children &&
                                category.children.some(
                                  (child) => child.level === 1
                                ) && (
                                  <div className="w-full flex space-x-6">
                                    {category.children
                                      .filter((child) => child.level === 1)
                                      .slice(0, 3)
                                      .map((childLevel1) => (
                                        <div
                                          key={childLevel1.id}
                                          className="flex-1 min-w-0"
                                        >
                                          <h3 className="font-semibold border-b border-gray-200 text-gray-900 mb-2 py-2">
                                            {childLevel1.name}
                                          </h3>

                                          <ul className="space-y-2">
                                            {childLevel1.postList
                                              ?.slice(0, 7)
                                              .map((post) => (
                                                <li key={post.id}>
                                                  <a
                                                    href={`/tin-tuc/${post.slug}`}
                                                    className="block py-1 text-gray-700 hover:text-blue-600"
                                                  >
                                                    {post.name}
                                                  </a>
                                                </li>
                                              ))}

                                            {/* LUÔN HIỂN THỊ */}
                                            <li>
                                              <a
                                                href={`/tra-cuu/${childLevel1.slug}`}
                                                className="block py-1 text-blue-600 font-semibold"
                                              >
                                                Tra cứu thêm
                                              </a>
                                            </li>
                                          </ul>
                                        </div>
                                      ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={toggleMenu}
            ></div>

            <div className="absolute top-0 left-0 w-full h-full bg-white shadow-lg overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-600">YouMed</h1>
                <button onClick={toggleMenu} className="text-gray-500">
                  ✕
                </button>
              </div>

              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="block py-2 px-3 text-black hover:bg-blue-50 rounded"
                    >
                      <GoHomeFill className="inline mr-2" />
                      Trang chủ
                    </a>
                  </li>

                  {categories.map((category) => (
                    <li key={category.id}>
                      <div
                        className={`block py-2 px-3 text-black hover:bg-blue-50 rounded cursor-pointer ${
                          activeCategory === category.id
                            ? "bg-blue-50 font-semibold"
                            : ""
                        }`}
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        {category.name}
                        {category.children && (
                          <span className="float-right">›</span>
                        )}
                      </div>

                      {/* Hiển thị danh mục cấp 2 trường hợp không có cấp 1 */}
                      {activeCategory === category.id &&
                        !category.children.some(
                          (child) => child.level === 1
                        ) && (
                          <ul className="ml-4 mt-1 space-y-1">
                            {category.postList?.slice(0, 7).map((item) => (
                              <li key={item.id}>
                                <a
                                  className="block py-2 px-3 text-gray-700 hover:bg-blue-50 rounded"
                                  href={`/tra-cuu/${item.slug}`}
                                >
                                  {item.name}
                                </a>
                              </li>
                            ))}
                            {category.postList?.length > 7 && (
                              <li>
                                <a
                                  href={`/tra-cuu/${category.slug}`}
                                  className="block py-1 text-blue-600 font-semibold"
                                >
                                  Tra cứu thêm
                                </a>
                              </li>
                            )}
                          </ul>
                        )}
                      {/* Hiển thị danh mục cấp 1 */}
                      {activeCategory === category.id && category.children && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {category.children.map((subCategory) => (
                            <li key={subCategory.id}>
                              <div
                                className={`block  py-2 px-3 text-black hover:bg-blue-50 rounded cursor-pointer ${
                                  activeSubCategory === subCategory.id
                                    ? "bg-blue-50 font-semibold"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleSubCategoryClick(subCategory.id)
                                }
                              >
                                {subCategory.name}
                                {subCategory.children &&
                                  subCategory.level !== 2 && (
                                    <span className="float-right">›</span>
                                  )}
                              </div>

                              {/* Hiển thị danh mục cấp 2 */}
                              {activeSubCategory === subCategory.id &&
                                subCategory.postList && (
                                  <ul className="ml-4 mt-1 space-y-1">
                                    {subCategory.postList.map((item) => (
                                      <li key={item.id}>
                                        <a
                                          className="block py-2 px-3 text-gray-700 hover:bg-blue-50 rounded"
                                          href={`/tra-cuu/${item.slug}`}
                                        >
                                          {item.name}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
