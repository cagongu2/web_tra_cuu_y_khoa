import React from "react";
import { useGetImageByTypeQuery } from "../redux/features/image/imageAPI";
import { getImgUrl } from "../util/getImgUrl";

export const Banner = () => {
  const { data: banner } = useGetImageByTypeQuery("banner");

  return (
    <div className="overflow-hidden">
      <img 
        src={getImgUrl(banner?.url)} 
        alt={banner?.alt || "Website banner"} 
        className="w-[1366px] h-[187px] object-cover"
        loading="lazy"
      />
    </div>
  );
};