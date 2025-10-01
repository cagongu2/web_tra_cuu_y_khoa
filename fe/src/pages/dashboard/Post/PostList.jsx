import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaHome,
  FaSearch,
  FaBars,
  FaPlus,
  FaTrash,
  FaSync,
} from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import EditPostForm from "./EditPostForm";
import AddPostForm from "./AddPostForm";
import {
  useDeletePostMutation,
  useGetAllPostsQuery,
  useUpdatePostMutation,
} from "../../../redux/features/post/postAPI";
import { Link } from "react-router-dom";

const PostList = () => {
  const [page, setPage] = useState(0);
  const size = 10;

  // --- RTK query hooks ---
  const { data, isLoading, error, refetch } = useGetAllPostsQuery({
    page,
    size,
  });
  console.log(data);
  const posts = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.number || 0;

  const { register, handleSubmit } = useForm();
  const [deletePost] = useDeletePostMutation();
  const [updatePost] = useUpdatePostMutation();

  const [showFilters, setShowFilters] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  useEffect(() => {
    if (error) {
      setNotification({
        type: "error",
        message: "Lỗi khi tải dữ liệu bài viết",
      });
    }
  }, [error]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const onSubmit = (data) => {
    console.log("Tìm kiếm:", data);
    // Implement search functionality here
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 3000);
  };

  const ToggleSwitch = ({ isOn, onToggle, postId, type }) => {
    // Convert string variable to boolean
    const isActive = isOn === "show" || isOn === true;

    const handleToggle = async () => {
      try {
        // Determine the new value based on the type
        let updatedValue;
        if (type === "status") {
          updatedValue = isActive ? "hidden" : "show";
        } else {
          updatedValue = !isActive;
        }

        await updatePost({
          id: postId,
          [type]: updatedValue,
        }).unwrap();

        onToggle();
        showNotification("success", `Cập nhật thành công`);
      } catch (error) {
        console.error("Lỗi khi cập nhật:", error);
        showNotification("error", "Lỗi khi cập nhật");
      }
    };

    return (
      <div className="flex items-center justify-center">
        <div
          className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors duration-300 ${
            isActive ? "bg-blue-500" : "bg-gray-400"
          }`}
          onClick={handleToggle}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
              isActive ? "transform translate-x-5" : "transform translate-x-0.5"
            }`}
          ></div>
        </div>
        <span className="ml-2 text-xs font-medium hidden sm:block">
          {isActive ? "ON" : "OFF"}
        </span>
      </div>
    );
  };

  // Function to handle when the edit button is pressed
  const handleEditClick = (post) => {
    setEditingPost(post);
    setIsEditFormOpen(true);
  };

  // Function to handle when close the form
  const handleCloseForm = () => {
    setIsEditFormOpen(false);
    setIsAddFormOpen(false);
    setEditingPost(null);
  };

  // Function to handle when save the post
  const handleSavePost = async (postData) => {
    try {
      await updatePost({
        id: postData.id,
        ...postData,
      }).unwrap();

      setIsEditFormOpen(false);
      setEditingPost(null);
      showNotification("success", "Cập nhật bài viết thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      showNotification("error", "Lỗi khi cập nhật bài viết");
    }
  };

  // Function to handle when add new post
  const handleAddPost = async (postData) => {
    try {
      // This would be handled by the AddPostForm component
      setIsAddFormOpen(false);
      showNotification("success", "Thêm bài viết thành công");
    } catch (error) {
      console.error("Lỗi khi thêm bài viết:", error);
      showNotification("error", "Lỗi khi thêm bài viết");
    }
  };

  // Function to handle when adding button is pressed
  const handleAddClick = () => {
    setIsAddFormOpen(true);
  };

  // Function to handle when check or uncheck post
  const handleSelectPost = (postId) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter((id) => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  // Function to handle when check or uncheck all post
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map((post) => post.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết đã chọn?`)) {
      try {
        await deletePost(postId).unwrap();

        showNotification("success", "Đã xóa bài viết thành công");
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        showNotification("error", "Lỗi khi xóa bài viết");
      }
    }
  };

  // Function to handle when deleting button is pressed
  const handleDeleteClick = async () => {
    if (selectedPosts.length === 0) {
      showNotification("warning", "Vui lòng chọn ít nhất một bài viết để xóa");
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedPosts.length} bài viết đã chọn?`
      )
    ) {
      try {
        const deletePromises = selectedPosts.map((id) =>
          deletePost(id).unwrap()
        );
        await Promise.all(deletePromises);

        setSelectedPosts([]);
        setSelectAll(false);
        showNotification(
          "success",
          `Đã xóa ${selectedPosts.length} bài viết thành công`
        );
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        showNotification("error", "Lỗi khi xóa bài viết");
      }
    }
  };

  // refresh data
  const handleRefresh = () => {
    refetch();
    showNotification("info", "Đang làm mới dữ liệu...");
  };

  if (isLoading) {
    return (
      <div className="mt-4 md:mt-10 mx-2 md:mx-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 md:mt-10 mx-2 md:mx-8">
      {/* Notification */}
      {notification.message && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === "error"
              ? "bg-red-100 text-red-800"
              : notification.type === "success"
              ? "bg-green-100 text-green-800"
              : notification.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="w-full flex items-center gap-3 px-2 py-2 border border-gray-200 rounded bg-white">
        <div className="text-gray-600">
          <FaHome />
        </div>
        <div className="text-sm md:text-base">Danh sách bài viết</div>
      </div>

      {/* Action buttons */}
      <div className="mt-2 w-full flex flex-wrap items-center gap-2 text-sm text-white">
        <button
          className="bg-blue-600 py-1 px-2 rounded text-xs md:text-sm flex items-center gap-1"
          onClick={handleAddClick}
        >
          <FaPlus size={10} />
          <span>Thêm</span>
        </button>
        <button
          className="bg-red-600 py-1 px-2 rounded text-xs md:text-sm flex items-center gap-1"
          onClick={handleDeleteClick}
        >
          <FaTrash size={10} />
          <span>Chọn Xóa ({selectedPosts.length})</span>
        </button>
        <button
          className="bg-green-600 py-1 px-2 rounded text-xs md:text-sm flex items-center gap-1"
          onClick={handleRefresh}
        >
          <FaSync size={10} />
          <span>Làm mới</span>
        </button>
        <button
          className="md:hidden bg-gray-600 py-1 px-2 rounded text-xs flex items-center gap-1"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaBars size={12} />
          <span>Bộ lọc</span>
        </button>
      </div>

      {/* Filters */}
      <div
        className={`mt-2 w-full bg-white border border-gray-200 rounded p-2 ${
          showFilters ? "block" : "hidden md:block"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-500 cursor-pointer"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <span className="ml-2 text-sm">Chọn tất cả</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
            <div className="flex flex-col md:flex-row items-center gap-2">
              <div className="relative flex-1">
                <FaSearch
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="text"
                  {...register("search-title")}
                  placeholder="Nhập từ khóa tìm kiếm"
                  id="search-title"
                  className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button className="w-full md:w-auto bg-blue-600 py-1 px-4 rounded text-white text-sm whitespace-nowrap">
                Tìm Kiếm
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table - Desktop view */}
      <div className="hidden md:block mt-2 bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 uppercase">
            <tr>
              <th className="p-3 border-b border-blue-100 text-center w-12">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3 border-b border-blue-100 text-center w-28">
                Thứ tự
              </th>
              <th className="p-3 border-b border-blue-100 text-left">
                Danh mục
              </th>
              <th className="p-3 border-b border-blue-100 text-left">
                Tiêu đề bài viết
              </th>
              {/* <th className="p-3 border-b border-blue-100 text-center w-28">
                Nổi bật
              </th> */}
              <th className="p-3 border-b border-blue-100 text-center w-28">
                Ẩn/Hiện
              </th>
              <th className="p-3 border-b border-blue-100 text-center w-32">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post, index) => (
              <tr
                key={post.id}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                    checked={selectedPosts.includes(post.id)}
                    onChange={() => handleSelectPost(post.id)}
                  />
                </td>
                <td className="p-3 text-center font-mono">
                  {/* {post.order || post.id} */}
                  {index + 1}
                </td>
                <td className="p-3">{post.categoryName || "Chưa phân loại"}</td>
                <td className="p-3 font-medium text-blue-700">
                  <Link
                    to={`/tin-tuc/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </td>
                {/* <td className="p-3 text-center">
                  <ToggleSwitch 
                    isOn={post.featured} 
                    onToggle={() => {}} 
                    postId={post.id}
                    type="featured"
                  />
                </td> */}
                <td className="p-3 text-center">
                  <ToggleSwitch
                    isOn={post.status}
                    onToggle={() => {}}
                    postId={post.id}
                    type="status"
                  />
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors duration-150"
                      onClick={() => handleEditClick(post)}
                    >
                      <MdEdit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors duration-150"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <IoMdClose className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Cards */}
      <div className="mt-2 md:hidden space-y-3">
        {posts.map((post, index) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-500 cursor-pointer mr-2"
                  checked={selectedPosts.includes(post.id)}
                  onChange={() => handleSelectPost(post.id)}
                />
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  #{/* {post.order || post.id} */}
                  {index + 1}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-1 bg-blue-100 text-blue-600 rounded"
                  onClick={() => handleEditClick(post)}
                >
                  <MdEdit className="h-4 w-4" />
                </button>
                <button
                  className="p-1 bg-red-100 text-red-600 rounded"
                  onClick={() => handleDeletePost(post.id)}
                >
                  <IoMdClose className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="font-medium text-blue-700 text-sm">
                <Link
                  to={`/tin-tuc/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="text-gray-600 text-xs mt-1">
                {post.category?.name || "Chưa phân loại"}
              </p>
            </div>

            <div className="mt-3 flex justify-between items-center">
              {/* <div>
                <span className="text-xs text-gray-500 mr-2">Nổi bật:</span>
                <ToggleSwitch
                  isOn={post.featured}
                  onToggle={() => {}}
                  postId={post.id}
                  type="featured"
                />
              </div> */}
              <div>
                <span className="text-xs text-gray-500 mr-2">Hiển thị:</span>
                <ToggleSwitch
                  isOn={post.status}
                  onToggle={() => {}}
                  postId={post.id}
                  type="status"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center space-x-1">
          <button
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 rounded border text-sm bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`px-3 py-1 rounded border text-sm ${
                i === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage + 1 === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 rounded border text-sm bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Show editing form when isEditFormOpen = true */}
      {isEditFormOpen && (
        <EditPostForm
          post={editingPost}
          onClose={handleCloseForm}
          onSave={handleSavePost}
        />
      )}

      {/* Show adding form when isAddFormOpen = true */}
      {isAddFormOpen && (
        <AddPostForm onClose={handleCloseForm} onSave={handleAddPost} />
      )}
    </div>
  );
};

export default PostList;
