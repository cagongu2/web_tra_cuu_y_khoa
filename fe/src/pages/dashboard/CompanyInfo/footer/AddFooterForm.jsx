import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { useCreateFooterMutation } from "../../../../redux/features/footer/footerAPI";
import { IoMdClose } from "react-icons/io";
import { useGetPostsByStatusQuery } from "../../../../redux/features/post/postAPI";

const AddFooterForm = ({ onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();
  
  const { data: posts = [], isLoading: postsLoading } = useGetPostsByStatusQuery("show");
  const [createFooter, { isLoading: isCreating }] = useCreateFooterMutation();
  const [selectedPosts, setSelectedPosts] = useState([]);

  const postOptions = posts?.map((post) => ({
    value: post.id,
    label: post.title || post.name,
  })) || [];

  const onSubmit = async (data) => {
    try {
      const postIds = selectedPosts.map((post) => post.value);

      const footerData = {
        ...data,
        postIds: postIds,
        isActive: data.isActive === "true" || data.isActive === true,
      };

      const result = await createFooter(footerData).unwrap();
      
      onSave?.(result);
      reset();
      setSelectedPosts([]);
      onClose?.();
    } catch (error) {
      console.error("Lỗi khi thêm footer:", error);
      // Có thể thêm thông báo lỗi cho người dùng ở đây
    }
  };

  const handleClose = () => {
    if (isDirty || selectedPosts.length > 0) {
      const confirmClose = window.confirm(
        "Bạn có chắc muốn đóng? Các thay đổi chưa lưu sẽ bị mất."
      );
      if (!confirmClose) return;
    }
    onClose?.();
  };

  // Reset form khi component unmount hoặc khi đóng
  useEffect(() => {
    return () => {
      reset();
      setSelectedPosts([]);
    };
  }, [reset]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            Thêm Footer mới
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            type="button"
            disabled={isCreating}
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Tên công ty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên công ty *
            </label>
            <input
              type="text"
              {...register("companyName", {
                required: "Tên công ty là bắt buộc",
                minLength: {
                  value: 2,
                  message: "Tên công ty phải có ít nhất 2 ký tự"
                }
              })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Nhập tên công ty"
              disabled={isCreating}
            />
            {errors.companyName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Tên đầy đủ công ty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đầy đủ công ty
            </label>
            <input
              type="text"
              {...register("companyFullName", {
                minLength: {
                  value: 2,
                  message: "Tên đầy đủ phải có ít nhất 2 ký tự"
                }
              })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Nhập tên đầy đủ công ty"
              disabled={isCreating}
            />
            {errors.companyFullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.companyFullName.message}
              </p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả công ty
            </label>
            <textarea
              {...register("companyDescription", {
                maxLength: {
                  value: 500,
                  message: "Mô tả không được vượt quá 500 ký tự"
                }
              })}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
              placeholder="Nhập mô tả về công ty"
              disabled={isCreating}
            />
            {errors.companyDescription && (
              <p className="text-red-500 text-xs mt-1">
                {errors.companyDescription.message}
              </p>
            )}
          </div>

          {/* Địa chỉ văn phòng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ văn phòng
            </label>
            <input
              type="text"
              {...register("officeAddress")}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Nhập địa chỉ văn phòng"
              disabled={isCreating}
            />
          </div>

          {/* Hotline + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotline
              </label>
              <input
                type="text"
                {...register("hotline", {
                  pattern: {
                    value: /^[0-9+\-\s()]*$/,
                    message: "Số hotline không hợp lệ"
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập số hotline"
                disabled={isCreating}
              />
              {errors.hotline && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.hotline.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ"
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập địa chỉ email"
                disabled={isCreating}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Bản quyền + Giấy phép */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bản quyền
              </label>
              <input
                type="text"
                {...register("copyrightText")}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập thông tin bản quyền"
                disabled={isCreating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giấy phép kinh doanh
              </label>
              <input
                type="text"
                {...register("businessLicense")}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập số giấy phép kinh doanh"
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Giờ làm việc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giờ làm việc
            </label>
            <input
              type="text"
              {...register("workingHours")}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="VD: Thứ 2 - Thứ 6: 8:00 - 17:00"
              disabled={isCreating}
            />
          </div>

          {/* Chọn bài viết */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn bài viết (có thể chọn nhiều)
            </label>
            <Select
              isMulti
              options={postOptions}
              value={selectedPosts}
              onChange={setSelectedPosts}
              isLoading={postsLoading}
              placeholder={postsLoading ? "Đang tải bài viết..." : "Tìm kiếm và chọn bài viết..."}
              noOptionsMessage={() => "Không tìm thấy bài viết nào"}
              className="react-select-container"
              classNamePrefix="react-select"
              isDisabled={isCreating || postsLoading}
            />
            {selectedPosts.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Đã chọn {selectedPosts.length} bài viết
              </p>
            )}
          </div>

          {/* Liên kết mạng xã hội */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                {...register("facebookUrl", {
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                    message: "URL không hợp lệ"
                  }
                })}
                placeholder="https://facebook.com/..."
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isCreating}
              />
              {errors.facebookUrl && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.facebookUrl.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube URL
              </label>
              <input
                type="url"
                {...register("youtubeUrl", {
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                    message: "URL không hợp lệ"
                  }
                })}
                placeholder="https://youtube.com/..."
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isCreating}
              />
              {errors.youtubeUrl && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.youtubeUrl.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter URL
              </label>
              <input
                type="url"
                {...register("twitterUrl", {
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                    message: "URL không hợp lệ"
                  }
                })}
                placeholder="https://twitter.com/..."
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isCreating}
              />
              {errors.twitterUrl && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.twitterUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái *
            </label>
            <select
              {...register("isActive", { required: "Trạng thái là bắt buộc" })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isCreating}
            >
              <option value={true}>Hiện</option>
              <option value={false}>Ẩn</option>
            </select>
            {errors.isActive && (
              <p className="text-red-500 text-xs mt-1">
                {errors.isActive.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              disabled={isCreating}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang thêm...
                </>
              ) : (
                "Thêm Footer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFooterForm;