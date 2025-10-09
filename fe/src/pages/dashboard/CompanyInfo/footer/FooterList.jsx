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
import { useDeleteFooterMutation, useGetAllFootersQuery, useUpdateFooterMutation } from "../../../../redux/features/footer/footerAPI";
import EditFooterForm from "./EditFooterForm";
import AddFooterForm from "./AddFooterForm";

export const FooterList = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data, isLoading, error, refetch } = useGetAllFootersQuery();

  const searchData = useMemo(() => {
    if (!searchKeyword.trim()) return null;
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [searchKeyword, data]);

  // Use search data if searching, otherwise use normal data
  const footers = useMemo(() => {
    return searchKeyword ? searchData || [] : data || [];
  }, [searchKeyword, searchData, data]);

  const { register, handleSubmit, watch } = useForm();
  const [deleteFooter] = useDeleteFooterMutation();
  const [updateFooter] = useUpdateFooterMutation();

  const [showFilters, setShowFilters] = useState(false);
  const [editingFooter, setEditingFooter] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedFooters, setSelectedFooters] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  const searchInputValue = watch("search-title");

  useEffect(() => {
    if (error) {
      setNotification({
        type: "error",
        message: "Lỗi khi tải dữ liệu footer",
      });
    }
  }, [error]);

  useEffect(() => {
    // Reset selection when data changes
    setSelectedFooters([]);
    setSelectAll(false);
  }, [footers]);

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

  const ToggleSwitch = ({ isOn, onToggle, footerId: id, type }) => {
    // Convert string variable to boolean
    const isActive = isOn === "show" || isOn === true;

    const handleToggle = async () => {
      try {
        // Determine the new value based on the type
       const updatedValue = !isActive;

        await updateFooter({
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
  const handleEditClick = (footer) => {
    setEditingFooter(footer);
    console.log(footer)
    setIsEditFormOpen(true);
  };

  // Function to handle when close the form
  const handleCloseForm = () => {
    setIsEditFormOpen(false);
    setIsAddFormOpen(false);
    setEditingFooter(null);
  };

  // Function to handle when save the footer
  const handleSaveFooter = async (footerData) => {
    try {
      await updateFooter({
        id: footerData.id,
        ...footerData,
      }).unwrap();

      setIsEditFormOpen(false);
      setEditingFooter(null);
      showNotification("success", "Cập nhật footer thành công");
      refetch(); // Refresh data after update
    } catch (error) {
      console.error("Lỗi khi cập nhật footer:", error);
      showNotification("error", "Lỗi khi cập nhật footer");
    }
  };

  // Function to handle when add new footer
  const handleAddFooter = async () => {
    try {
      // This would be handled by the AddFooterForm component
      setIsAddFormOpen(false);
      showNotification("success", "Thêm footer thành công");
      refetch(); // Refresh data after add
    } catch (error) {
      console.error("Lỗi khi thêm footer:", error);
      showNotification("error", "Lỗi khi thêm footer");
    }
  };

  // Function to handle when adding button is pressed
  const handleAddClick = () => {
    setIsAddFormOpen(true);
  };

  // Function to handle when check or uncheck post
  const handleSelectFooter = (footerId) => {
    if (selectedFooters.includes(footerId)) {
      setSelectedFooters(selectedFooters.filter((id) => id !== footerId));
    } else {
      setSelectedFooters([...selectedFooters, footerId]);
    }
  };

  // Function to handle when check or uncheck all post
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFooters([]);
    } else {
      setSelectedFooters(footers.map((footer) => footer.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteFooter = async (footer) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa footer đã chọn?`)) {
      try {
        await deleteFooter(footer).unwrap();

        showNotification("success", "Đã xóa footer thành công");
        refetch(); // Refresh data after delete
      } catch (error) {
        console.error("Lỗi khi xóa footer:", error);
        showNotification("error", "Lỗi khi xóa footer");
      }
    }
  };

  // Function to handle when deleting button is pressed
  const handleDeleteClick = async () => {
    if (selectedFooters.length === 0) {
      showNotification("warning", "Vui lòng chọn ít nhất một footer để xóa");
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedFooters.length} footer đã chọn?`
      )
    ) {
      try {
        const deletePromises = selectedFooters.map((id) =>
          deleteFooter(id).unwrap()
        );
        await Promise.all(deletePromises);

        setSelectedFooters([]);
        setSelectAll(false);
        showNotification(
          "success",
          `Đã xóa ${selectedFooters.length} footer thành công`
        );
        refetch(); // Refresh data after delete
      } catch (error) {
        console.error("Lỗi khi xóa footer:", error);
        showNotification("error", "Lỗi khi xóa footer");
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
          Danh sách footer
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
          <span>Chọn Xóa ({selectedFooters.length})</span>
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
            {footers.length > 0 && (
              <span> - Tìm thấy {footers.length} kết quả</span>
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
                Tên công ty
              </th>
              <th className="p-3 border-b border-blue-100 text-center w-56">
                Mô tả
              </th>
              <th className="p-3 border-b border-blue-100 text-center w-28">
                Ẩn/Hiện
              </th>
              <th className="p-3 border-b border-blue-100 text-center w-32">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {footers.length > 0 ? (
              footers.map((footer, index) => (
                <tr
                  key={footer.id}
                  className="hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                      checked={selectedFooters.includes(footer.id)}
                      onChange={() => handleSelectFooter(footer.id)}
                    />
                  </td>
                  <td className="p-3 text-center font-mono">{index + 1}</td>

                  <td className="p-3 text-center font-medium text-blue-700">
                    {footer.companyName}
                  </td>
                  <td className="p-3 text-center">{footer.companyDescription}</td>

                  <td className="p-3 text-center">
                    <ToggleSwitch
                      isOn={footer.isActive}
                      onToggle={() => {}}
                      categoryId={footer.id}
                      type="isActive"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition-colors duration-150"
                        onClick={() => handleEditClick(footer)}
                      >
                        <MdEdit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors duration-150"
                        onClick={() => handleDeleteFooter(footer.id)}
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
                    ? "Không tìm thấy footer nào phù hợp"
                    : "Không có footer nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Cards */}
      <div className="mt-2 md:hidden space-y-3">
        {footers.length > 0 ? (
          footers.map((footer, index) => (
            <div key={footer.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500 cursor-pointer mr-2"
                    checked={selectedFooters.includes(footer.id)}
                    onChange={() => handleSelectFooter(footer.id)}
                  />
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="p-1 bg-blue-100 text-blue-600 rounded"
                    onClick={() => handleEditClick(footer)}
                  >
                    <MdEdit className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 bg-red-100 text-red-600 rounded"
                    onClick={() => handleDeleteFooter(footer.id)}
                  >
                    <IoMdClose className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-medium text-blue-700 text-sm">
                  {footer.companyName}
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  {footer.companyDescription}
                </p>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 mr-2">Hiển thị:</span>
                  <ToggleSwitch
                    isOn={footer.isActive}
                    onToggle={() => {}}
                    categoryId={footer.id}
                    type="isActive"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
            {isSearching
              ? "Không tìm thấy footer nào phù hợp"
              : "Không có footer nào"}
          </div>
        )}
      </div>

      {/* Show editing form when isEditFormOpen = true */}
      {isEditFormOpen && (
        <EditFooterForm
          footer={editingFooter}
          onClose={handleCloseForm}
          onSave={handleSaveFooter}
        />
      )}

      {/* Show adding form when isAddFormOpen = true */}
      {isAddFormOpen && (
        <AddFooterForm onClose={handleCloseForm} onSave={handleAddFooter} />
      )}
    </div>
  );
};

export default FooterList;
