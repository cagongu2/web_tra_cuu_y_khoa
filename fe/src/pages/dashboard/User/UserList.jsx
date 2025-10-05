import React, { useEffect, useMemo, useState } from "react";

import { useForm } from "react-hook-form";
import {
  FaBars,
  FaHome,
  FaPlus,
  FaSearch,
  FaSync,
  FaTrash,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import {
  useGetAllUsersQuery,
  useUpdateUserMutation,
} from "../../../redux/features/users/userAPI";
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";

export const UserList = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data, isLoading, error, refetch } = useGetAllUsersQuery();

  const searchData = useMemo(() => {
    if (!searchKeyword.trim()) return null;
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [searchKeyword, data]);

  const users = useMemo(() => {
      return searchKeyword ? searchData || [] : data || [];
    }, [searchKeyword, searchData, data]);

  const { register, handleSubmit, watch } = useForm();

  // const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const [showFilters, setShowFilters] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

   const searchInputValue = watch("search-title");

  useEffect(() => {
    if (error) {
      setNotification({
        type: "error",
        message: "Lỗi khi tải danh sách người dùng",
      });
    }
  }, [error]);

  useEffect(() => {
    // Reset selection when data changes
    setSelectedUsers([]);
    setSelectAll(false);
  }, [users]);

  const onSubmit = (data) => {
    const keyword = data["search-title"]?.trim();
    if (keyword) {
      setSearchKeyword(keyword);
      setIsSearching(true);
      showNotification("info", `Đang tìm kiếm: "${keyword}"`);
    } else {
      // If search is empty, switch back to normal list
      handleClearSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword("");
    setIsSearching(false);
    if (searchInputValue) {
      showNotification("info", "Đã xóa tìm kiếm");
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: "", message: "" }), 3000);
  };

  const ToggleSwitch = ({ isOn, onToggle, categoryId: id, type }) => {
    // Convert string variable to boolean
    const isActive = isOn === "show" || isOn === true;

    const handleToggle = async () => {
      try {
        // Determine the new value based on the type
       const updatedValue = !isActive;

        await updateUser({
          id: id,
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
  const handleEditClick = (user) => {
    setEditingUser(user);
    console.log(user)
    setIsEditFormOpen(true);
  };

  // Function to handle when close the form
  const handleCloseForm = () => {
    setIsEditFormOpen(false);
    setIsAddFormOpen(false);
    setEditingUser(null);
  };

  // Function to handle when save the post
  const handleSavePost = async (userData) => {
    try {
      await updateUser({
        id: userData.id,
        ...userData,
      }).unwrap();

      setIsEditFormOpen(false);
      setEditingUser(null);
      showNotification("success", "Cập nhật người dùng thành công");
      refetch(); // Refresh data after update
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      showNotification("error", "Lỗi khi cập nhật người dùng");
    }
  };

  // Function to handle when add new post
  const handleAddUser = async () => {
    try {
      // This would be handled by the AddPostForm component
      setIsAddFormOpen(false);
      showNotification("success", "Thêm người dùng thành công");
      refetch(); // Refresh data after add
    } catch (error) {
      console.error("Lỗi khi thêm người dùng:", error);
      showNotification("error", "Lỗi khi thêm người dùng");
    }
  };

  // Function to handle when adding button is pressed
  const handleAddClick = () => {
    setIsAddFormOpen(true);
  };

  // Function to handle when check or uncheck post
  const handleSelectUser = (postId) => {
    if (selectedUsers.includes(postId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== postId));
    } else {
      setSelectedUsers([...selectedUsers, postId]);
    }
  };

  // Function to handle when check or uncheck all post
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((post) => post.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteUser = async (postId) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh sách người dùng đã chọn?`)) {
      try {
        await deleteUser(postId).unwrap();

        showNotification("success", "Đã xóa danh sách người dùng thành công");
        refetch(); // Refresh data after delete
      } catch (error) {
        console.error("Lỗi khi xóa danh sách người dùng:", error);
        showNotification("error", "Lỗi khi xóa danh sách người dùng");
      }
    }
  };

  // Function to handle when deleting button is pressed
  const handleDeleteClick = async () => {
    if (selectedUsers.length === 0) {
      showNotification("warning", "Vui lòng chọn ít nhất một người dùng để xóa");
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedUsers.length} danh sách người dùng đã chọn?`
      )
    ) {
      try {
        const deletePromises = selectedUsers.map((id) =>
          deleteUser(id).unwrap()
        );
        await Promise.all(deletePromises);

        setSelectedUsers([]);
        setSelectAll(false);
        showNotification(
          "success",
          `Đã xóa ${selectedUsers.length} danh sách người dùng thành công`
        );
        refetch(); // Refresh data after delete
      } catch (error) {
        console.error("Lỗi khi xóa danh sách người dùng:", error);
        showNotification("error", "Lỗi khi xóa danh sách người dùng");
      }
    }
  };

  // refresh data
  const handleRefresh = () => {
    refetch();
    if (isSearching) {
      showNotification("info", "Đang làm mới kết quả tìm kiếm...");
    } else {
      showNotification("info", "Đang làm mới dữ liệu...");
    }
  };

  const isLoadingState = isLoading;

  if (isLoadingState) {
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
        <div className="text-sm md:text-base">
          Danh sách người dùng
          {isSearching && (
            <span className="ml-2 text-blue-600">
              - Tìm kiếm: "{searchKeyword}"
            </span>
          )}
        </div>
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
          <span>Chọn Xóa ({selectedUsers.length})</span>
        </button>
        <button
          className="bg-green-600 py-1 px-2 rounded text-xs md:text-sm flex items-center gap-1"
          onClick={handleRefresh}
        >
          <FaSync size={10} />
          <span>Làm mới</span>
        </button>
        {isSearching && (
          <button
            className="bg-gray-600 py-1 px-2 rounded text-xs md:text-sm flex items-center gap-1"
            onClick={handleClearSearch}
          >
            <IoMdClose size={10} />
            <span>Xóa tìm kiếm</span>
          </button>
        )}
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
              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 py-1 px-4 rounded text-white text-sm whitespace-nowrap"
              >
                Tìm Kiếm
              </button>
              {isSearching && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="w-full md:w-auto bg-gray-500 py-1 px-4 rounded text-white text-sm whitespace-nowrap"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Search results info */}
      {isSearching && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            Đang hiển thị kết quả tìm kiếm cho:{" "}
            <strong>"{searchKeyword}"</strong>
            {users.length > 0 && (
              <span> - Tìm thấy {users.length} kết quả</span>
            )}
          </p>
        </div>
      )}

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
              <th className="p-3 border-b border-blue-100 text-center w-28">
                Tên tài khoản
              </th>
              <th className="p-3 border-b border-blue-100 text-center w-28">
                Email
              </th>
              <th className="p-3 border-b border-blue-100 text-center w-28">
                Ẩn/Hiện
              </th>
              <th className="p-3 border-b border-blue-100 text-center w-28">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td className="p-3 text-center font-mono">{index + 1}</td>

                  <td className="p-3 text-center font-medium text-blue-700">
                    {user.username}
                  </td>
                  <td className="p-3 text-center">{user.email}</td>

                  <td className="p-3 text-center">
                    <ToggleSwitch
                      isOn={user.isActive}
                      onToggle={() => {}}
                      categoryId={user.id}
                      type="isActive"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors duration-150"
                        onClick={() => handleEditClick(user)}
                      >
                        <MdEdit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors duration-150"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <IoMdClose className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  {isSearching
                    ? "Không tìm thấy danh sách người dùng nào phù hợp"
                    : "Không có danh sách người dùng nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Cards */}
      <div className="mt-2 md:hidden space-y-3">
        {users.length > 0 ? (
          users.map((user, index) => (
            <div key={user.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500 cursor-pointer mr-2"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="p-1 bg-blue-100 text-blue-600 rounded"
                    onClick={() => handleEditClick(user)}
                  >
                    <MdEdit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 bg-red-100 text-red-600 rounded"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <IoMdClose className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-medium text-blue-700 text-sm">
                  {user.name}
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  {user.parentId ? 1 : 0}
                </p>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 mr-2">Hiển thị:</span>
                  <ToggleSwitch
                    isOn={user.isActive}
                    onToggle={() => {}}
                    categoryId={user.id}
                    type="isActive"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
            {isSearching
              ? "Không tìm thấy danh sách người dùng nào phù hợp"
              : "Không có danh sách người dùng nào"}
          </div>
        )}
      </div>

      {/* Show editing form when isEditFormOpen = true */}
      {isEditFormOpen && (
        <EditUserForm
          user={editingUser}
          onClose={handleCloseForm}
          onSave={handleSavePost}
        />
      )}

      {/* Show adding form when isAddFormOpen = true */}
      {isAddFormOpen && (
        <AddUserForm onClose={handleCloseForm} onSave={handleAddUser} />
      )}
    </div>
  );
};

export default UserList;
