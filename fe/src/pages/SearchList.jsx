import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSearchPostQuery } from "../redux/features/post/postAPI";
import { getImgUrl } from "../util/getImgUrl";

export const SearchList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("s") || "";

  const { data, isLoading } = useSearchPostQuery(searchQuery);
  const { register, handleSubmit } = useForm();

  React.useEffect(() => {
    if (!isLoading && data && data.length === 0) {
      navigate("/tra-cuu/tat-ca-thong-tin", { replace: true });
    }
  }, [data, isLoading, navigate]);


  const onSubmit = (formData) => {
    const query = formData["search-title"]?.trim();
    if (query) {
      navigate(`/tra-cuu?s=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="bg-white w-full px-4 text-sm">
      <div className="max-w-[530px] mx-auto my-8">
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <input
            {...register("search-title")}
            defaultValue={searchQuery}
            placeholder="Tìm kiếm bài viết, thông tin bệnh, thuốc..."
            className="w-full py-3 px-6 border rounded-sm"
          />
        </form>

        {Array.isArray(data) && (
          <span className="block mt-2 text-gray-400">
            {data.length} kết quả được tìm thấy
          </span>
        )}
      </div>

      <div className="max-w-[600px] mx-auto">
        {isLoading && <p>Đang tải...</p>}

        {Array.isArray(data) &&
          data.length > 0 &&
          data.map((post) => (
            <div key={post.id} className="flex gap-4 mb-8 bg-gray-50">
              <Link to={`/tin-tuc/${post.slug}`}>
                <img
                  src={
                    post.thumbnail_url
                      ? getImgUrl(post.thumbnail_url)
                      : "https://images.pexels.com/photos/3812757/pexels-photo-3812757.jpeg"
                  }
                  alt={post.name}
                  className="w-28 h-28 rounded-2xl object-cover"
                />
              </Link>

              <div className="flex flex-col justify-center">
                <h2 className="text-lg font-medium">
                  <Link to={`/tin-tuc/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                <span className="text-gray-400 text-sm">
                  {post.authorName}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
