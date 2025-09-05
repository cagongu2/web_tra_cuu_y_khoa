import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { GoHomeFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useGetAllCategoriesQuery } from "../redux/features/categories/categoryAPI";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const { data: categories, error, isLoading } = useGetAllCategoriesQuery(0);

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

  const navigate = useNavigate();

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

  return (
    <>
      <header className="bg-white shadow-sm w-full">
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
            <h1 className="text-2xl font-bold text-blue-600">YouMed</h1>
          </div>
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
        </div>

        <div className="hidden lg:block border-1 border-gray-100"></div>
        <div className="hidden lg:block max-w-[1130px] my-0 mx-auto">
          {/* Menu chính */}
          <nav className="">
            <ul className=" flex space-x-5 text-sm font-semibold items-center py-2 px-4">
              <li className="relative">
                <a href="#" className="text-black hover:text-blue-600">
                  <GoHomeFill />
                </a>
              </li>

              {!isLoading &&
                categories &&
                categories.length > 0 &&
                categories.map((category) => (
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
                                      .slice(0, 3)
                                      .map((childLevel1) => (
                                        <div
                                          key={childLevel1.id}
                                          className="flex-1 min-w-0"
                                        >
                                          <h3 className="font-semibold border-b-1 border-gray-200 text-gray-900 mb-2 py-2">
                                            {childLevel1.name}
                                          </h3>
                                          <ul className="space-y-2">
                                            {childLevel1.postList
                                              ?.slice(
                                                0,
                                                childLevel1.id ===
                                                  category.children[2]?.id
                                                  ? 6
                                                  : 7
                                              )
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
                                            {childLevel1.id ===
                                              category.children[2]?.id &&
                                              childLevel1.postList?.length >
                                                6 && (
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
