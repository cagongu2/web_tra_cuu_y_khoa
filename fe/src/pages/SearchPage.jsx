import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCategoryBySlugQuery } from "../redux/features/categories/categoryAPI";

export const SearchPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: category, isLoading, error } = useGetCategoryBySlugQuery(slug);

  // 🟢 Hook phải nằm trên cùng, không sau return
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Loading, error check
  if (isLoading) {
    return <div className="p-4">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Lỗi tải dữ liệu!</div>;
  }

  if (!category) {
    return <div className="text-red-500 p-4">Danh mục không tồn tại.</div>;
  }

  // Khởi tạo nhóm A-Z
  const groupedChildren = {};
  for (let i = 65; i <= 90; i++) {
    groupedChildren[String.fromCharCode(i)] = [];
  }

  // Nhóm post theo chữ cái
  category.postList?.forEach((post) => {
    const firstChar = post.name.charAt(0).toUpperCase();
    if (groupedChildren[firstChar]) {
      groupedChildren[firstChar].push(post);
    }
  });

  const onSubmit = (data) => {
    const searchQuery = data["search-title"]?.trim();
    if (searchQuery) {
      navigate(`/tra-cuu?s=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-white w-full text-sm text-gray-700 mt-1">
      <div className="max-w-[1130px] mx-auto pt-4 px-4 text-left">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600">
          <a className="text-blue-500" href="/">
            Trang chủ
          </a>
        </div>

        {/* Tiêu đề */}
        <section className="pt-12">
          <h1 className="font-serif text-2xl md:text-4xl font-bold my-4">
            {category.name}
          </h1>
        </section>

        {/* Input + A-Z */}
        <section>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group flex flex-row gap-2">
              <input
                type="text"
                {...register("search-title", { required: true })}
                placeholder="Nhập thông tin"
                id="search-title"
                className="w-full py-3 px-6 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </form>

          <h2 className="font-bold text-lg my-2">Tìm theo bảng chữ cái</h2>

          <ul className="flex flex-wrap mb-4 gap-3">
            {Object.keys(groupedChildren).map((letter) => (
              <li key={letter} className="w-10 h-10">
                <button
                  onClick={() =>
                    document
                      .getElementById(`a-z-listing-letter-${letter}`)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="cursor-pointer w-full h-full bg-slate-100 rounded"
                >
                  {letter}
                </button>
              </li>
            ))}
          </ul>

          {/* Danh sách chuyên mục theo chữ cái */}
          {Object.keys(groupedChildren).map((letter) => {
            const group = groupedChildren[letter];
            if (group.length === 0) return null;

            return (
              <div
                key={letter}
                className="mb-8"
                id={`a-z-listing-letter-${letter}`}
              >
                <h2 className="mb-4 font-semibold text-xl border-b border-gray-200">
                  {letter}
                </h2>
                <ul className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 text-base gap-2">
                  {group.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`/tin-tuc/${item.slug}`}
                        className="text-black hover:underline"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="text-right mt-2">
                  <a
                    href={`#a-z-listing-letter-${letter}`}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Back to top
                  </a>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};
