import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { useUpdateUserMutation } from "../../../redux/features/users/userAPI";
import { getImgUrl } from "../../../util/getImgUrl";

export const EditUserForm = ({ user, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [previewImage, setPreviewImage] = useState(null);
  const [isServerImage, setIsServerImage] = useState(
    user.avatar_url ? true : false
  );

  useEffect(() => {
    if (isServerImage) {
      setPreviewImage(getImgUrl(user.avatar_url));
      setIsServerImage(true);
    }
    if (user) {
      setValue("username", user.username);
      setValue("email", user.email);
      setValue("phone", user.phone);
      setValue("isActive", user.isActive);
    }
  }, [user, setValue, isServerImage]);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const onSubmit = async (data) => {
    try {
      console.log(data);
      const modifiedData = {
        ...data,
        file: data.file instanceof FileList ? data.file[0] : data.file,
      };
      await updateUser({
        id: user.id,
        ...modifiedData,
      }).unwrap();

      onSave({
        id: user.id,
        ...modifiedData,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      alert(`Error: ${error.data?.message || "Failed to update user"}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      const previewURL = URL.createObjectURL(file);
      setPreviewImage(previewURL);
      setIsServerImage(false);
      setValue("file", file); // Set single File object
    } else {
      setPreviewImage(null);
      setValue("file", undefined); // Clear file if none selected
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Thêm người dùng mới
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh đại diện
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />

            {previewImage && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">
                  {isServerImage ? "Ảnh hiện tại:" : "Ảnh mới chọn:"}
                </p>
                <img
                  src={previewImage}
                  alt="Avatar Preview"
                  className="w-48 h-32 object-cover rounded-lg border"
                />
              </div>
            )}

            {errors.file && (
              <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>
            )}
          </div>
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập *
            </label>
            <input
              type="text"
              {...register("username", {
                required: "Tên đăng nhập là bắt buộc",
              })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email là bắt buộc",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ",
                },
              })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu *
            </label>
            <input
              type="password"
              {...register("password", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 6,
                  message: "Mật khẩu ít nhất 6 ký tự",
                },
              })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div> */}

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              {...register("phone", {
                pattern: {
                  value: /^[0-9]{9,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái *
            </label>
            <select
              {...register("isActive", {
                required: "Trạng thái là bắt buộc",
              })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value={true}>Kích hoạt</option>
              <option value={false}>Vô hiệu hóa</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Đang update..." : "Update người dùng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserForm;
