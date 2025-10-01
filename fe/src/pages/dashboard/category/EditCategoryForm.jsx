import React, { useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import {
  useGetAllCategoriesFlatQuery,
  useUpdateCategoryMutation,
} from "../../../redux/features/categories/categoryAPI";

const EditCategoryForm = ({ category: editingCategory, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { data: categories, isLoading: isCategoriesLoading } =
    useGetAllCategoriesFlatQuery();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  // Populate form fields when category data is available
  useEffect(() => {
    if (editingCategory) {
      setValue("name", editingCategory.name);
      setValue("slug", editingCategory.slug);
      setValue("description", editingCategory.description);
      setValue("isActive", editingCategory.isActive);
      setValue("parent", editingCategory.parentId || "");
    }
  }, [editingCategory, setValue]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      if (data.parent === "") {
        data.parent = null;
      }
      await updateCategory({
        id: editingCategory.id,
        ...data,
      }).unwrap();
      onSave({
        ...data,
        id: editingCategory.id,
      });
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Generate slug from title
  const generateSlug = (title) => {
    if (!title) return "";

    return title
      .toLowerCase()
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Update name and slug on input change
  const handleNameChange = (e) => {
    const name = e.target.value;
    setValue("name", name);
    setValue("slug", generateSlug(name));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Chỉnh sửa danh mục
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isUpdating}
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          {/* Category Name & Title */}

          <div className="mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên danh mục *
              </label>
              <input
                type="text"
                {...register("name", { required: "Tên danh mục là bắt buộc" })}
                onChange={handleNameChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                {...register("slug", { required: "Slug là bắt buộc" })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              />
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả *
              </label>
              <input
                type="text"
                {...register("description")}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái *
              </label>
              <select
                {...register("isActive", {
                  required: "Trạng thái là bắt buộc",
                })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              >
                <option value={true}>Hiện</option>
                <option value={false}>Ẩn</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục cha
            </label>
            <select
              {...register("parent")}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCategoriesLoading}
            >
              <option value="">-- Không có --</option>
              {categories
                ?.filter((cat) => cat.parentId === null)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>

            {errors.category && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Buttons */}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              disabled={isUpdating}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isUpdating}
            >
              {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryForm;
