import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSearchPostQuery } from "../redux/features/post/postAPI";

export const SearchList = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("s") || "";

  const { data, isLoading, error } = useSearchPostQuery(searchQuery);

  const { register, handleSubmit } = useForm();

  const onSubmit = (formData) => {
    const query = formData["search-title"]?.trim();
    if (query) {
      navigate(`/tra-cuu?s=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <div className="bg-white w-full text-sm text-gray-700  px-4">
        <div className="max-w-[530px] mx-auto my-8">
          <form
            className="relative w-[530px]"
            onSubmit={handleSubmit(onSubmit)}
          >
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

          {data && (
            <span className="mt-2 text-left text-gray-400 block text-base">
              {data.total || data.length} kết quả được tìm thấy
            </span>
          )}
        </div>

       <div className="max-w-[600px] mx-auto">
        {isLoading && <p>Đang tải...</p>}
        
        {data && data.length > 0 ? (
          data.map((post) => (
            <div key={post.id} className="flex flex-row gap-4 mb-8 bg-gray-50">
              <Link
                to={`/tin-tuc/${post.slug}`}
                title={post.name}
                className="relative overflow-hidden rounded flex-none"
              >
                <img
                  width="150"
                  height="150"
                  src={post.thumbnail || "https://cdn.pixabay.com/photo/2017/09/23/04/02/dice-2777809_1280.jpg"}
                  className="overflow-hidden rounded-2xl w-28 h-28 aspect-square"
                  alt={post.name}
                />
              </Link>
              <div className="flex flex-col justify-center">
                <h2 className="text-lg font-medium line-clamp-2">
                  <Link
                    to={`/tin-tuc/${post.slug}`}
                    className="hover:border-b border-primary hover:text-primary"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm space-x-3 mt-1">
                  <span className="text-gray-400">{post.authorName}</span>
                  {/* <time className="text-gray-400">
                    {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
                  </time> */}
                </p>
              </div>
            </div>
          ))
        ) : (
          !isLoading && <p>Không tìm thấy kết quả</p>
        )}
      </div>
      </div>
    </>
  );
};
