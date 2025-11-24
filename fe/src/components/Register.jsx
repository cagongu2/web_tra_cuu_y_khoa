import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useCreateUserMutation,
  useExistsByEmailQuery,
  useExistsByUsernameQuery,
} from "../redux/features/users/userAPI";

const Register = () => {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm();

  const watchEmail = watch("email");
  const watchUsername = watch("username");

  // Kiểm tra email đã tồn tại chưa
  const { data: emailExists, refetch: checkEmail } = useExistsByEmailQuery(
    watchEmail,
    {
      skip: !watchEmail || errors.email,
    }
  );

  // Kiểm tra username đã tồn tại chưa
  const { data: usernameExists, refetch: checkUsername } =
    useExistsByUsernameQuery(watchUsername, {
      skip: !watchUsername || errors.username,
    });

  // Tự động kiểm tra khi email thay đổi
  useEffect(() => {
    if (watchEmail && !errors.email) {
      const timer = setTimeout(() => {
        checkEmail();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchEmail, errors.email, checkEmail]);

  // Tự động kiểm tra khi username thay đổi
  useEffect(() => {
    if (watchUsername && !errors.username) {
      const timer = setTimeout(() => {
        checkUsername();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchUsername, errors.username, checkUsername]);

  const onSubmit = async (data) => {
    try {
      // Kiểm tra lại trước khi gửi
      await trigger();

      if (emailExists) {
        setMessage("Email này đã được sử dụng");
        return;
      }

      if (usernameExists) {
        setMessage("Tên người dùng này đã tồn tại");
        return;
      }

      const response = await createUser({
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone,
      }).unwrap();

      if (response?.id) {
        setSuccess(true);
        setMessage("");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage("Đăng ký không thành công. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Đăng ký không thành công. Vui lòng thử lại.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 py-6 px-8">
            <h2 className="text-2xl font-bold text-white text-center">
              Đăng ký thành công
            </h2>
          </div>
          <div className="py-8 px-8 text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-green-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <p className="text-gray-700 mb-6">
              Tài khoản của bạn đã được tạo thành công!
            </p>
            <p className="text-gray-600 text-sm">
              Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát...
            </p>
            <div className="mt-6">
              <Link
                to="/dang-nhap"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
              >
                Đến trang đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-8">
          <h2 className="text-2xl font-bold text-white text-center">
            Đăng ký tài khoản
          </h2>
        </div>

        <div className="py-8 px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Tên người dùng */}
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="username"
              >
                Tên người dùng
              </label>
              <input
                {...register("username", {
                  required: "Tên người dùng không được để trống",
                  minLength: {
                    value: 3,
                    message: "Tên người dùng phải có ít nhất 3 ký tự",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message:
                      "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới",
                  },
                })}
                type="text"
                id="username"
                placeholder="Tên người dùng"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.username.message}
                </p>
              )}
              {usernameExists && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  Tên người dùng này đã tồn tại
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                {...register("email", {
                  required: "Email không được để trống",
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                    message: "Email không hợp lệ",
                  },
                })}
                type="email"
                id="email"
                placeholder="Địa chỉ email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
              {emailExists && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  Email này đã được sử dụng
                </p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <input
                {...register("password", {
                  required: "Mật khẩu không được để trống",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                type="password"
                id="password"
                placeholder="Mật khẩu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="confirmPassword"
              >
                Xác nhận mật khẩu
              </label>
              <input
                {...register("confirmPassword", {
                  required: "Vui lòng xác nhận mật khẩu",
                  validate: (value) =>
                    value === watch("password") ||
                    "Mật khẩu xác nhận không khớp",
                })}
                type="password"
                id="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Error message */}
            {message && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm font-medium">{message}</p>
              </div>
            )}

            <div>
              <div>
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="phone"
                >
                  Số điện thoại
                </label>
                <input
                  {...register("phone", {
                    required: "Số điện thoại không được để trống",
                    pattern: {
                      value: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  })}
                  type="tel"
                  id="phone"
                  placeholder="Số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                    Đang xử lý...
                  </span>
                ) : (
                  "Đăng ký"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-800 transition duration-200"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
