import React, { useState } from "react";
import { GoHomeFill } from "react-icons/go";

const categories = [
  {
    id: 1,
    name: "Tra cứu bệnh",
    level: 0,
    parent_id: null,
    children: [
      { id: 2, name: "Răng - Hàm - Mặt", level: 2, parent_id: 1 },
      { id: 3, name: "Tai - Mũi - Họng", level: 2, parent_id: 1 },
      { id: 4, name: "Da liễu", level: 2, parent_id: 1 },
      { id: 5, name: "Nhãn khoa", level: 2, parent_id: 1 },
      { id: 6, name: "Cơ Xương Khớp", level: 2, parent_id: 1 },
      { id: 7, name: "Dinh Dưỡng", level: 2, parent_id: 1 },
      { id: 8, name: "Sức khỏe nam giới", level: 2, parent_id: 1 },
      { id: 9, name: "Sức khoẻ nữ giới", level: 2, parent_id: 1 },
      { id: 10, name: "Sức khỏe tình dục", level: 2, parent_id: 1 },
      { id: 11, name: "Thần kinh", level: 2, parent_id: 1 },
      { id: 12, name: "Hô hấp", level: 2, parent_id: 1 },
      { id: 13, name: "Dị ứng", level: 2, parent_id: 1 },
      { id: 14, name: "Nội tiết", level: 2, parent_id: 1 },
      { id: 15, name: "Tiêu hóa - Gan mật", level: 2, parent_id: 1 },
      { id: 16, name: "Thận - Tiết niệu", level: 2, parent_id: 1 },
      { id: 17, name: "Ung bướu", level: 2, parent_id: 1 },
      { id: 18, name: "Xét nghiệm", level: 2, parent_id: 1 },
      { id: 19, name: "Thể dục thể thao", level: 2, parent_id: 1 },
      { id: 20, name: "Thực phẩm chức năng", level: 2, parent_id: 1 },
    ],
  },
  {
    id: 21,
    name: "Tra cứu Thuốc & Dược liệu",
    level: 0,
    parent_id: null,
    children: [
      {
        id: 22,
        name: "Thuốc",
        level: 1,
        parent_id: 21,
        children: [
          { id: 23, name: "Paracetamol", level: 2, parent_id: 22 },
          { id: 24, name: "Glucosamine", level: 2, parent_id: 22 },
          { id: 25, name: "Aspirin", level: 2, parent_id: 22 },
          { id: 26, name: "Panadol Extra", level: 2, parent_id: 22 },
          { id: 27, name: "Ginkgo Biloba", level: 2, parent_id: 22 },
          { id: 28, name: "Hoạt huyết dưỡng não", level: 2, parent_id: 22 },
        ],
      },
      {
        id: 29,
        name: "Dược liệu",
        level: 1,
        parent_id: 21,
        children: [
          { id: 30, name: "Linh chi", level: 2, parent_id: 29 },
          { id: 31, name: "Hạt chia", level: 2, parent_id: 29 },
          { id: 32, name: "Đông trùng hạ thảo", level: 2, parent_id: 29 },
          { id: 33, name: "Cây Lưỡi hổ", level: 2, parent_id: 29 },
          { id: 34, name: "Hương thảo", level: 2, parent_id: 29 },
          { id: 35, name: "Bồ công anh", level: 2, parent_id: 29 },
        ],
      },
      {
        id: 36,
        name: "Các bộ phận cơ thể",
        level: 1,
        parent_id: 21,
        children: [
          { id: 37, name: "Dạ dày", level: 2, parent_id: 36 },
          { id: 38, name: "Thận", level: 2, parent_id: 36 },
          { id: 39, name: "Dương vật", level: 2, parent_id: 36 },
          { id: 40, name: "Âm đạo", level: 2, parent_id: 36 },
          { id: 41, name: "Gan", level: 2, parent_id: 36 },
          { id: 42, name: "DNA là gì?", level: 2, parent_id: 36 },
        ],
      },
    ],
  },
  {
    id: 43,
    name: "Mang thai & Nuôi dạy con",
    level: 0,
    parent_id: null,
    children: [
      {
        id: 44,
        name: "Mang thai",
        level: 1,
        parent_id: 43,
        children: [
          { id: 45, name: "Chuẩn bị mang thai", level: 2, parent_id: 44 },
          { id: 46, name: "Dinh dưỡng thai kỳ", level: 2, parent_id: 44 },
          { id: 47, name: "Tiêm phòng thai kỳ", level: 2, parent_id: 44 },
          { id: 48, name: "Chăm sóc mẹ bầu", level: 2, parent_id: 44 },
          { id: 49, name: "42 tuần mang thai", level: 2, parent_id: 44 },
          { id: 50, name: "Quá trình sinh nở", level: 2, parent_id: 44 },
        ],
      },
      {
        id: 51,
        name: "Nuôi dạy con",
        level: 1,
        parent_id: 43,
        children: [
          { id: 52, name: "Tiêm phòng cho bé", level: 2, parent_id: 51 },
          { id: 53, name: "Năm đầu đời", level: 2, parent_id: 51 },
          {
            id: 54,
            name: "Các bệnh thường gặp ở trẻ",
            level: 2,
            parent_id: 51,
          },
          { id: 55, name: "Đồng hành cùng con", level: 2, parent_id: 51 },
          {
            id: 56,
            name: "Phát triển thể chất và trí não",
            level: 2,
            parent_id: 51,
          },
          { id: 57, name: "Tuổi dậy thì", level: 2, parent_id: 51 },
        ],
      },
      {
        id: 58,
        name: "Bài viết được quan tâm nhiều",
        level: 1,
        parent_id: 43,
        children: [
          { id: 59, name: "Dấu hiệu mang thai", level: 2, parent_id: 58 },
          { id: 60, name: "Mang thai tuần 1", level: 2, parent_id: 58 },
          {
            id: 61,
            name: "Tiêm phòng trước khi mang thai",
            level: 2,
            parent_id: 58,
          },
          { id: 62, name: "Chăm sóc trẻ sơ sinh", level: 2, parent_id: 58 },
          { id: 63, name: "Dậy thì sớm", level: 2, parent_id: 58 },
        ],
      },
    ],
  },
  {
    id: 65,
    name: "Chủ đề được quan tâm nhiều",
    level: 0,
    parent_id: null,
    children: [
      { id: 66, name: "Dấu hiệu mang thai", level: 2, parent_id: 65 },
      { id: 67, name: "Mang thai tuần 1", level: 2, parent_id: 65 },
      {
        id: 68,
        name: "Tiêm phòng trước khi mang thai",
        level: 2,
        parent_id: 65,
      },
      { id: 69, name: "Chăm sóc trẻ sơ sinh", level: 2, parent_id: 65 },
      { id: 70, name: "Dậy thì sớm", level: 2, parent_id: 65 },
    ],
  },
  {
    id: 72,
    name: "Kinh nghiệm đi khám",
    level: 0,
    parent_id: null,
    children: [
      { id: 73, name: "Bệnh viện uy tín", level: 2, parent_id: 72 },
      { id: 74, name: "Quy trình khám bệnh", level: 2, parent_id: 72 },
      { id: 75, name: "Chi phí khám chữa bệnh", level: 2, parent_id: 72 },
      { id: 76, name: "Bảo hiểm y tế", level: 2, parent_id: 72 },
      { id: 77, name: "Kinh nghiệm chọn bác sĩ", level: 2, parent_id: 72 },
    ],
  },
  {
    id: 78,
    name: "Bản tin sức khỏe",
    level: 0,
    parent_id: null,
    children: [
      { id: 79, name: "Tin tức y tế", level: 2, parent_id: 78 },
      { id: 80, name: "Nghiên cứu mới", level: 2, parent_id: 78 },
      { id: 81, name: "Phòng ngừa bệnh tật", level: 2, parent_id: 78 },
      { id: 82, name: "Lối sống lành mạnh", level: 2, parent_id: 78 },
      { id: 83, name: "Thực phẩm tốt cho sức khỏe", level: 2, parent_id: 78 },
    ],
  },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);

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
          <div className="relative w-100">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, thông tin bệnh, thuốc ..."
              className="w-full py-3 px-6 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="absolute right-3 top-2 text-gray-400">
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
          </div>
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

              {categories.map((category) => (
                <li key={category.id} className="group">
                  <div
                    onMouseEnter={() => setActiveCategory(category.id)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    {/* Thẻ cha: có group-hover */}
                    <a
                      href="#"
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
                                    {category.children
                                      .slice(0, 7)
                                      .map((child) => (
                                        <li
                                          key={child.id}
                                          className="group/child"
                                        >
                                          <a
                                            href={`/tintuc/${child.name
                                              .toLowerCase()
                                              .replace(/\s+/g, "-")}`}
                                            className="block py-1 text-gray-700 group-hover/child:text-blue-600"
                                          >
                                            {child.name}
                                          </a>
                                        </li>
                                      ))}
                                    {category.children.length > 7 && (
                                      <li>
                                        <a
                                          href={`/tintuc/${category.name
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")}`}
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
                                          {childLevel1.children
                                            .slice(
                                              0,
                                              childLevel1.id ===
                                                category.children[2]?.id
                                                ? 6
                                                : 7
                                            )
                                            .map((childLevel2) => (
                                              <li
                                                key={childLevel2.id}
                                                className="group/child"
                                              >
                                                <a
                                                  href={`/tintuc/${childLevel2.name
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "-")}`}
                                                  className="block py-1 text-gray-700 group-hover/child:text-blue-600"
                                                >
                                                  {childLevel2.name}
                                                </a>
                                              </li>
                                            ))}
                                          {childLevel1.id ===
                                            category.children[2]?.id &&
                                            childLevel1.children.length > 6 && (
                                              <li>
                                                <a
                                                  href={`/tintuc/${category.name
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "-")}`}
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

            <div className="absolute top-0 left-0 w-4/5 h-full bg-white shadow-lg overflow-y-auto">
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
                                {subCategory.children && (
                                  <span className="float-right">›</span>
                                )}
                              </div>

                              {/* Hiển thị danh mục cấp 2 */}
                              {activeSubCategory === subCategory.id &&
                                subCategory.children && (
                                  <ul className="ml-4 mt-1 space-y-1">
                                    {subCategory.children.map((item) => (
                                      <li key={item.id}>
                                        <a
                                          href="#"
                                          className="block py-2 px-3 text-gray-700 hover:bg-blue-50 rounded"
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
