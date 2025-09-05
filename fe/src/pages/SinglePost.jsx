import React from "react";
import { useParams } from "react-router-dom";
import { useGetPostBySlugQuery } from "../redux/features/post/postAPI";

export const SinglePost = () => {
  const { slug } = useParams();
  const { data: post, isLoading, error } = useGetPostBySlugQuery(slug);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load post</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{post?.title}</h1>

      {/* content có thể chứa HTML do Quill sinh ra */}
      <div
        className="prose prose-lg"
        dangerouslySetInnerHTML={{ __html: post?.content }}
      />
    </div>
  );
};
