import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { useUpdatePostMutation } from "../../../redux/features/post/postAPI";
import { useGetAllCategoriesFlatQuery } from "../../../redux/features/categories/categoryAPI";
import { useUploadImageMutation } from "../../../redux/features/upload/uploadApi";
import { getImgUrl } from "../../../util/getImgUrl";

const EditPostForm = ({ post, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { data: categories, isLoading: isCategoriesLoading } =
    useGetAllCategoriesFlatQuery();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [uploadImage] = useUploadImageMutation();
  const [content, setContent] = useState(post?.content || "");
  const [previewImage, setPreviewImage] = useState(null);
  const [isServerImage, setIsServerImage] = useState(
    post.thumbnail_url ? true : false
  );
  const quillRef = useRef(null);

  // Quill Editor modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image", "video"],
      ["clean"],
    ],

    clipboard: {
      matchVisual: false,
    },
  };

  // Quill allowed formats
  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "indent",
    "link",
    "image",
    "video",
  ];

  // Populate form fields when post data is available
  useEffect(() => {
    if (isServerImage) {
      setPreviewImage(getImgUrl(post.thumbnail_url));
      setIsServerImage(true);
    }
    if (post) {
      setValue("name", post.name);
      setValue("title", post.title);
      setValue("slug", post.slug);
      setValue("status", post.status);
      setValue("categoryId", post.categoryId || "");
      setContent(post.content);
    }
  }, [post, setValue, isServerImage]);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      console.log(data);
      await updatePost({
        id: post.id,
        ...data,
        content: content, // include Quill content
        file: data.file instanceof FileList ? data.file[0] : data.file,
      }).unwrap();

      onSave({
        ...data,
        content: content,
        id: post.id,
      });
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  // Generate slug from title
  const generateSlug = (title) => {
    if (!title) return "";

    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Update title and slug on input change
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setValue("title", title);
    setValue("slug", generateSlug(title));
  };

  // Upload image to server and return URL
  const uploadImageToServer = useCallback(
    async (file) => {
      try {
        const response = await uploadImage({ file, type: "posts" }).unwrap();
        return `http://localhost:8080/${response.relativePath}`;
      } catch (error) {
        console.error("Image upload failed:", error);
        throw new Error("Tải ảnh lên thất bại");
      }
    },
    [uploadImage]
  );

  // Compress large images before upload
  const compressImage = async (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve) => {
      if (file.size <= 300 * 1024) {
        resolve(file); // Skip compression for small images
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Process image file with loading state
  const processImageFile = useCallback(
    async (file) => {
      if (!quillRef.current) return;

      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);

      // Insert temporary loading image
      quill.insertEmbed(range.index, "image", "/loading-image.gif");

      try {
        // Validate file type and size
        if (!file.type.startsWith("image/")) {
          throw new Error("File không phải là hình ảnh");
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
          throw new Error("Kích thước file không được vượt quá 5MB");
        }

        const compressedFile = await compressImage(file);
        const imageUrl = await uploadImageToServer(compressedFile);

        // Replace loading image with actual image
        quill.deleteText(range.index, 1);
        quill.insertEmbed(range.index, "image", imageUrl);
        quill.setSelection(range.index + 1);

        // Update content state
        setContent(quill.root.innerHTML);
      } catch (error) {
        // Remove loading image on error
        quill.deleteText(range.index, 1);
        console.error("Image processing error:", error);
        alert(error.message || "Có lỗi xảy ra khi xử lý ảnh");
      }
    },
    [uploadImageToServer]
  );

  // Custom image handler for toolbar
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        await processImageFile(file);
      }
    };
  };

  // Handle paste event for images
  const handlePaste = useCallback(
    (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            processImageFile(file);
          }
          break;
        }
      }
    },
    [processImageFile]
  );

  // Handle drop event for images
  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const quill = quillRef.current?.getEditor();
      if (quill) {
        quill.focus();
      }

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (imageFiles.length > 0) {
        processImageFile(imageFiles[0]);
      }
    },
    [processImageFile]
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }

      const previewURL = URL.createObjectURL(file);
      setPreviewImage(previewURL);
      setIsServerImage(false);
      setValue("file", file);
    } else {
      setPreviewImage(null);
      setValue("file", undefined);
    }
  };

  // Quill modules including custom image handler and paste handler
  const updatedModules = {
    ...modules,
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image", "video"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: { matchVisual: false },
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Chỉnh sửa bài viết
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
          {/* Post Name & Title */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên bài viết *
              </label>

              <input
                type="text"
                {...register("name", { required: "Tên bài viết là bắt buộc" })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              />

              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề *
              </label>

              <input
                type="text"
                {...register("title", { required: "Tiêu đề là bắt buộc" })}
                onChange={handleTitleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              />

              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          {/* Slug & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                Trạng thái *
              </label>

              <select
                {...register("status", { required: "Trạng thái là bắt buộc" })}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              >
                <option value="hidden">Ẩn</option>

                <option value="show">Hiện</option>
              </select>

              {errors.status && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          {/* Category */}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục *
            </label>

            <select
              {...register("categoryId", { required: "Danh mục là bắt buộc" })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCategoriesLoading}
            >
              {categories?.map((cat) => (
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUpdating}
            />

            {previewImage && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">
                  {isServerImage ? "Ảnh hiện tại:" : "Ảnh mới chọn:"}
                </p>
                <img
                  src={previewImage}
                  alt="Thumbnail Preview"
                  className="w-48 h-32 object-cover rounded-lg border"
                />
              </div>
            )}

            {errors.file && (
              <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>
            )}
          </div>

          {/* Content */}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung *
            </label>
            <div
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <ReactQuill
                ref={quillRef}
                value={content}
                onChange={setContent}
                modules={updatedModules}
                formats={formats}
                theme="snow"
                readOnly={isUpdating}
              />
            </div>

            {!content && (
              <p className="text-red-500 text-xs mt-1">Nội dung là bắt buộc</p>
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

export default EditPostForm;
