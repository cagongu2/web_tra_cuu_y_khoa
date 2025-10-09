import React from "react";
import { useParams } from "react-router-dom";
import { useGetPostBySlugQuery } from "../redux/features/post/postAPI";

export const SinglePost = () => {
  const { slug } = useParams();
  const { data: post, isLoading, error } = useGetPostBySlugQuery(slug);
  console.log(post);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load post</p>;

  return (
    <div className="">
      {/* content có thể chứa HTML do Quill sinh ra */}
      <div className="prose max-w-[1130px] mx-auto pt-4 px-4 text-left" dangerouslySetInnerHTML={{ __html: post?.content }} />
    </div>
  );
};
