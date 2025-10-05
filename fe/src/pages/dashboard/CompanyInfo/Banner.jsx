import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaHome, FaUpload, FaImage } from "react-icons/fa";
import { getImgUrl } from "../../../util/getImgUrl";
import {
  useGetImageByTypeQuery,
  useUploadImageMutation,
} from "../../../redux/features/image/imageAPI";

export const Banner = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [isServerImage, setIsServerImage] = useState(false);

  const {
    data: banner,
    isLoading: isBannerLoading,
    refetch,
  } = useGetImageByTypeQuery("banner");

  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  useEffect(() => {
    if (banner && banner.url) {
      setPreviewImage(getImgUrl(banner.url));
      setIsServerImage(true);
    }
  }, [banner]);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          type: "error",
          message: "Kích thước ảnh không được vượt quá 5MB!",
        });
        return;
      }

      // Kiểm tra định dạng file
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        setNotification({
          type: "error",
          message: "Chỉ chấp nhận file ảnh (JPEG, PNG, SVG, WebP)!",
        });
        return;
      }

      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
      const previewURL = URL.createObjectURL(file);
      setPreviewImage(previewURL);
      setIsServerImage(false);
      setValue("file", file);
      setNotification({ type: "", message: "" }); // Clear previous notifications
    } else {
      setPreviewImage(null);
      setValue("file", undefined);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!data.file) {
        setNotification({
          type: "warning",
          message: "Vui lòng chọn ảnh trước khi tải lên!",
        });
        return;
      }

      await uploadImage({
        type: "banner",
        file: data.file instanceof FileList ? data.file[0] : data.file,
      }).unwrap();

      setNotification({
        type: "success",
        message: "Cập nhật banner thành công!",
      });

      refetch();
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: "Đã xảy ra lỗi khi tải ảnh lên.",
      });
    }
  };

  // Auto hide notification after 5 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ type: "", message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.message]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      {/* Notification */}
      {notification.message && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm transform transition-all duration-300 ${
            notification.type === "error"
              ? "bg-red-50 border border-red-200 text-red-800"
              : notification.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : notification.type === "warning"
              ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === "error" && (
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {notification.type === "success" && (
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {notification.type === "warning" && (
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="">
        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-6">
              {/* File Upload Area */}
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FaHome className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">
                        Quản lý Banner
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        Tải lên và quản lý banner cho website của bạn
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comparison Box - 2 hàng */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                      {/* Tiêu đề bên trái */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          So sánh banner
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          So sánh banner hiện tại và banner mới trước khi cập
                          nhật
                        </p>
                      </div>

                      {/* Nút upload bên phải */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="file-upload"
                          className={`flex items-center px-4 py-2 rounded-lg text-white font-medium cursor-pointer transition ${
                            isUploading
                              ? "opacity-50 cursor-not-allowed bg-gray-400"
                              : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
                          }`}
                        >
                          <FaUpload className="text-white text-lg mr-2" />
                          <span className="text-sm">Chọn ảnh banner</span>
                        </label>

                        {/* Hiển thị lỗi nếu có */}
                        {errors.file && (
                          <div className="mt-2 flex items-center text-red-500 text-sm">
                            <svg
                              className="w-4 h-4 mr-1 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>{errors.file.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Layout 2 hàng thay vì 2 cột */}
                  <div className="space-y-8 p-6">
                    {/* Hàng 1: Banner hiện tại */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Banner hiện tại</span>
                        </h4>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full flex items-center space-x-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Đang hoạt động</span>
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center border-2 border-green-200">
                        {banner && banner.url ? (
                          <div className="text-center space-y-4 w-full">
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 w-full max-w-4xl mx-auto">
                              <img
                                src={getImgUrl(banner.url)}
                                alt="Banner hiện tại"
                                className="w-full h-auto max-h-32 object-contain mx-auto"
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">
                                Banner đang sử dụng
                              </p>
                              <p className="text-xs text-gray-500">
                                Được hiển thị trên website
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-3 text-gray-400 py-8">
                            <FaImage className="text-4xl mx-auto" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">
                                Chưa có banner
                              </p>
                              <p className="text-xs">Tải lên banner đầu tiên</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      {banner && banner.url && (
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <div className="flex items-center space-x-2 text-green-800">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium">
                              Banner này đang được sử dụng
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hàng 2: Banner mới */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>Banner mới</span>
                        </h4>
                        {previewImage && !isServerImage && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full flex items-center space-x-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>Sẵn sàng cập nhật</span>
                          </span>
                        )}
                      </div>

                      <div
                        className={`rounded-lg p-6 flex items-center justify-center border-2 ${
                          previewImage && !isServerImage
                            ? "border-blue-200 bg-blue-50/30"
                            : "border-gray-200 bg-gray-50 border-dashed"
                        }`}
                      >
                        {previewImage && !isServerImage ? (
                          <div className="text-center space-y-4 w-full">
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 w-full max-w-4xl mx-auto">
                              <img
                                src={previewImage}
                                alt="Banner mới preview"
                                className="w-full h-auto max-h-32 object-contain mx-auto"
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">
                                Banner mới
                              </p>
                              <p className="text-xs text-gray-500">
                                Sẽ thay thế banner hiện tại
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-3 text-gray-400 py-8">
                            <FaImage className="text-4xl mx-auto" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">
                                Chưa có banner mới
                              </p>
                              <p className="text-xs">Chọn ảnh để xem trước</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      {previewImage && !isServerImage && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center space-x-2 text-blue-800">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium">
                              Banner mới đã sẵn sàng để cập nhật
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer với button submit */}
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {previewImage && !isServerImage
                            ? "Kiểm tra kỹ banner mới trước khi cập nhật"
                            : "Chọn banner mới để bắt đầu so sánh"}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="submit"
                          disabled={
                            isUploading || !previewImage || isServerImage
                          }
                          className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                            isUploading || !previewImage || isServerImage
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
                          }`}
                        >
                          {isUploading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Đang cập nhật...
                            </>
                          ) : (
                            <>
                              <FaUpload className="mr-2" />
                              Cập nhật Banner
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Information Section */}
        <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Lưu ý</h3>
              <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
                <li>Kích thước ảnh tối đa: 5MB</li>
                <li>Định dạng hỗ trợ: PNG, JPG, SVG, WebP</li>
                <li>Kích thước banner đề xuất: 1366px x 114px</li>
                <li>Nên sử dụng ảnh có độ phân giải cao để hiển thị rõ nét</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
