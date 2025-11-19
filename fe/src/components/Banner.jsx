import React from "react";
import { useGetImageByTypeQuery } from "../redux/features/image/imageAPI";
import { getImgUrl } from "../util/getImgUrl";

export const Banner = () => {
  const { data: banner } = useGetImageByTypeQuery("banner");

  return (
    <div className="overflow-hidden">
      <section
        className="bg-cover bg-center flex items-center text-white w-[1584px] h-[396px] py-24 px-4"
        style={{
          backgroundImage: `url('${getImgUrl(
            banner?.url
          )}?auto=format&fit=crop&w=1350&q=80')`,
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Trang Tin Tức Y Khoa - Cập Nhật Kiến Thức Sức Khỏe
          </h2>
          <p className="text-lg mb-8">
            Cung cấp thông tin y khoa dựa trên mục đích tham khảo.
          </p>
          
        </div>
      </section>
    </div>
  );
};
