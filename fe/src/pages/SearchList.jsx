import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export const SearchList = () => {
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

          <span className="mt-2 text-left text-gray-400 block text-base">
            1899 kết quả được tìm thấy{" "}
          </span>
        </div>

        <div className="max-w-[530px] mx-auto">
          <div class="flex flex-row gap-4 mb-8">
            <a
              href="tin-tuc/:slug"
              title="Hướng dẫn bài tập và chế độ ăn cho người bị trĩ"
              class="relative overflow-hidden rounded flex-none"
              data-wpel-link="internal"
            >
              <img
                width="150"
                height="150"
                src="https://cdn.youmed.vn/tin-tuc/wp-content/uploads/2024/09/che-do-an-cho-nguoi-bi-tri-150x150.jpg"
                class="overflow-hidden rounded w-28 h-28 aspect-square aspect-child block wp-post-image"
                alt="Chế độ ăn cho người bị trĩ"
                decoding="async"
              />{" "}
            </a>
            <div class="flex flex-col justify-center">
              <h2 class="text-lg font-medium line-clamp-2">
                <a
                  href="tin-tuc/:slug"
                  title="Hướng dẫn bài tập và chế độ ăn cho người bị trĩ"
                  class="hover:border-b border-primary hover:text-primary"
                  data-wpel-link="internal"
                >
                  Hướng dẫn bài tập và chế độ ăn cho người bị trĩ
                </a>
              </h2>
              <p class="text-sm space-x-3 mt-1">
                <a
                  href="https://youmed.vn/tin-tuc/bac-si/bac-si-le-huynh-khanh-tien/"
                  class="text-gray-400"
                  data-wpel-link="internal"
                >
                  Bác sĩ Lê Huỳnh Khánh Tiên
                </a>
                <time
                  class="text-gray-400"
                  datetime="2024-10-28T11:57:49+07:00"
                >
                  Cập nhật: 28 Th10, 2024
                </time>
              </p>
            </div>
          </div>
          <div class="flex flex-row gap-4 mb-8">
            <a
              href="tin-tuc/:slug"
              title="Hướng dẫn bài tập và chế độ ăn cho người bị trĩ"
              class="relative overflow-hidden rounded flex-none"
              data-wpel-link="internal"
            >
              <img
                width="150"
                height="150"
                src="https://cdn.youmed.vn/tin-tuc/wp-content/uploads/2024/09/che-do-an-cho-nguoi-bi-tri-150x150.jpg"
                class="overflow-hidden rounded w-28 h-28 aspect-square aspect-child block wp-post-image"
                alt="Chế độ ăn cho người bị trĩ"
                decoding="async"
              />{" "}
            </a>
            <div class="flex flex-col justify-center">
              <h2 class="text-lg font-medium line-clamp-2">
                <a
                  href="tin-tuc/:slug"
                  title="Hướng dẫn bài tập và chế độ ăn cho người bị trĩ"
                  class="hover:border-b border-primary hover:text-primary"
                  data-wpel-link="internal"
                >
                  Hướng dẫn bài tập và chế độ ăn cho người bị trĩ
                </a>
              </h2>
              <p class="text-sm space-x-3 mt-1">
                <a
                  href="https://youmed.vn/tin-tuc/bac-si/bac-si-le-huynh-khanh-tien/"
                  class="text-gray-400"
                  data-wpel-link="internal"
                >
                  Bác sĩ Lê Huỳnh Khánh Tiên
                </a>
                <time
                  class="text-gray-400"
                  datetime="2024-10-28T11:57:49+07:00"
                >
                  Cập nhật: 28 Th10, 2024
                </time>
              </p>
            </div>
          </div>
          <div class="flex flex-row gap-4 mb-8">
            <a
              href="tin-tuc/:slug"
              title="Hướng dẫn bài tập và chế độ ăn cho người bị trĩ"
              class="relative overflow-hidden rounded flex-none"
              data-wpel-link="internal"
            >
              <img
                width="150"
                height="150"
                src="https://cdn.youmed.vn/tin-tuc/wp-content/uploads/2024/09/che-do-an-cho-nguoi-bi-tri-150x150.jpg"
                class="overflow-hidden rounded w-28 h-28 aspect-square aspect-child block wp-post-image"
                alt="Chế độ ăn cho người bị trĩ"
                decoding="async"
              />{" "}
            </a>
            <div class="flex flex-col justify-center">
              <h2 class="text-lg font-medium line-clamp-2">
                <a
                  href="tin-tuc/:slug"
                  title="Hướng dẫn bài tập và chế độ ăn cho người bị trĩ"
                  class="hover:border-b border-primary hover:text-primary"
                  data-wpel-link="internal"
                >
                  Hướng dẫn bài tập và chế độ ăn cho người bị trĩ
                </a>
              </h2>
              <p class="text-sm space-x-3 mt-1">
                <a
                  href="https://youmed.vn/tin-tuc/bac-si/bac-si-le-huynh-khanh-tien/"
                  class="text-gray-400"
                  data-wpel-link="internal"
                >
                  Bác sĩ Lê Huỳnh Khánh Tiên
                </a>
                <time
                  class="text-gray-400"
                  datetime="2024-10-28T11:57:49+07:00"
                >
                  Cập nhật: 28 Th10, 2024
                </time>
              </p>
            </div>
          </div>
          <div class="flex flex-row gap-4 mb-8">
            <a
              href="tin-tuc/:slug"
              title="Hướng dẫn bài tập và chế độ ăn cho người bị trĩ"
              class="relative overflow-hidden rounded flex-none"
              data-wpel-link="internal"
            >
              <img
                width="150"
                height="150"
                src="https://cdn.youmed.vn/tin-tuc/wp-content/uploads/2024/09/che-do-an-cho-nguoi-bi-tri-150x150.jpg"
                class="overflow-hidden rounded w-28 h-28 aspect-square aspect-child block wp-post-image"
                alt="Chế độ ăn cho người bị trĩ"
                decoding="async"
              />{" "}
            </a>
            <div class="flex flex-col justify-center">
              <h2 class="text-lg font-medium line-clamp-2">
                <a
                  href="tin-tuc/:slug"
                  title="Hướng dẫn bài tập và chế độ ăn cho người bị trĩ"
                  class="hover:border-b border-primary hover:text-primary"
                  data-wpel-link="internal"
                >
                  Hướng dẫn bài tập và chế độ ăn cho người bị trĩ
                </a>
              </h2>
              <p class="text-sm space-x-3 mt-1">
                <a
                  href="https://youmed.vn/tin-tuc/bac-si/bac-si-le-huynh-khanh-tien/"
                  class="text-gray-400"
                  data-wpel-link="internal"
                >
                  Bác sĩ Lê Huỳnh Khánh Tiên
                </a>
                <time
                  class="text-gray-400"
                  datetime="2024-10-28T11:57:49+07:00"
                >
                  Cập nhật: 28 Th10, 2024
                </time>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
