import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCategoryBySlugQuery } from "../redux/features/categories/categoryAPI";
import { useGetAllPostsQuery } from "../redux/features/post/postAPI";
import { skipToken } from "@reduxjs/toolkit/query";

export const SearchPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const isAll = !slug || slug === "tat-ca-thong-tin";

  const {
    data: category,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useGetCategoryBySlugQuery(slug, { skip: isAll });

  const {
    data: allPosts,
    isLoading: isAllPostsLoading,
    error: allPostsError,
  } = useGetAllPostsQuery(isAll ? { page: 0, size: 1000 } : skipToken);

  const postList = isAll ? allPosts?.content ?? [] : category?.postList ?? [];

  const { register, handleSubmit } = useForm();

  if (isAll && isAllPostsLoading) {
    return <div className="p-4">Đang tải dữ liệu...</div>;
  }

  if (!isAll && isCategoryLoading) {
    return <div className="p-4">Đang tải dữ liệu...</div>;
  }

  if (isAll && !isAllPostsLoading && allPostsError) {
    return <div className="p-4 text-red-500">Lỗi tải danh sách bài viết!</div>;
  }

  if (!isAll && !isCategoryLoading && categoryError) {
    return <div className="p-4 text-red-500">Lỗi tải danh mục!</div>;
  }

  if (!isAll && !category) {
    return <div className="p-4 text-red-500">Danh mục không tồn tại.</div>;
  }

  // Khởi tạo nhóm A-Z
  const groupedChildren = {};
  for (let i = 65; i <= 90; i++) {
    groupedChildren[String.fromCharCode(i)] = [];
  }

  // Nhóm post theo chữ cái
  postList?.forEach((post) => {
    if (!post?.name) return;
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
          <h1 className="font-sans text-2xl md:text-4xl font-bold my-4">
            {isAll ? "Tất cả thông tin" : category.name}
          </h1>
        </section>

        {/* Search */}
        <section>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              {...register("search-title", { required: true })}
              placeholder="Nhập thông tin"
              className="w-full py-3 px-6 border border-gray-300 rounded-sm"
            />
          </form>

          <h2 className="font-bold text-lg my-2">Tìm theo bảng chữ cái</h2>

          <ul className="flex flex-wrap mb-4 gap-3">
            {Object.keys(groupedChildren).map((letter) => (
              <li key={letter} className="w-10 h-10">
                <button
                  onClick={() =>
                    document
                      .getElementById(`a-z-${letter}`)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-full h-full bg-slate-100 rounded"
                >
                  {letter}
                </button>
              </li>
            ))}
          </ul>

          {Object.keys(groupedChildren).map((letter) => {
            const group = groupedChildren[letter];
            if (group.length === 0) return null;

            return (
              <div key={letter} id={`a-z-${letter}`} className="mb-8">
                <h2 className="mb-4 font-semibold text-xl border-b border-gray-200">
                  {letter}
                </h2>
                <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                  {group.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`/tin-tuc/${item.slug}`}
                        className="hover:underline"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};
