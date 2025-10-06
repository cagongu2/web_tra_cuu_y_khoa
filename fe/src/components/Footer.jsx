import React from "react";
import { FaFacebookSquare, FaTwitter, FaYoutube } from "react-icons/fa";
import { useGetFootersByStatusQuery } from "../redux/features/footer/footerAPI";

const Footer = () => {
  const { data, isLoading, error } = useGetFootersByStatusQuery(true);

  if (isLoading) {
    return <p className="text-center py-4">Đang tải footer...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-4">Lỗi khi tải footer.</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-center py-4">Không có dữ liệu footer.</p>;
  }

  const footer = data[0]; // vì API trả về mảng 1 phần tử

  return (
    <footer className="bg-white border-t border-gray-200 text-sm text-gray-700 mt-10 w-full">
      <div className="max-w-[1130px] mx-auto py-4 px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Thông tin công ty */}
        <div className="space-y-2 md:col-span-2">
          <h3 className="font-semibold uppercase text-black">
            {footer.companyFullName}
          </h3>
          <p>
            <strong>VPĐD:</strong> {footer.officeAddress}
          </p>
          <p>
            <strong>Hotline:</strong>{" "}
            <span className="text-blue-600 font-semibold">{footer.hotline}</span>{" "}
            | {footer.workingHours}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <span className="text-blue-600 font-semibold">{footer.email}</span>
          </p>
        </div>

        {/* Cột 2: Danh sách bài viết từ postList */}
        <div className="space-y-2">
          <h4 className="font-semibold text-black">Bài viết nổi bật</h4>
          <ul className="space-y-1">
            {footer.postList?.map((post) => (
              <li key={post.id}>
                <a
                  href={`/bai-viet/${post.slug}`}
                  className="hover:text-blue-600"
                >
                  {post.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 3: Mạng xã hội */}
        <div className="space-y-2">
          <h4 className="font-semibold text-black">Kết nối với chúng tôi</h4>
          <div className="flex space-x-3 mt-2 text-xl text-gray-600">
            {footer.facebookUrl && (
              <a href={footer.facebookUrl} target="_blank" rel="noopener noreferrer">
                <FaFacebookSquare />
              </a>
            )}
            {footer.youtubeUrl && (
              <a href={footer.youtubeUrl} target="_blank" rel="noopener noreferrer">
                <FaYoutube />
              </a>
            )}
            {footer.twitterUrl && (
              <a href={footer.twitterUrl} target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Dòng dưới cùng */}
      <div className="border-t border-gray-200 w-full"></div>
      <div className="max-w-[1130px] mx-auto pt-6 pb-4 px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p className="text-center md:text-left">
          Các thông tin trên {footer.companyName} chỉ dành cho mục đích tham
          khảo, tra cứu và không thay thế cho việc chẩn đoán hoặc điều trị y
          khoa. Cần tuyệt đối tuân theo hướng dẫn của Bác sĩ và Nhân viên y tế.
        </p>
        <p className="mt-2 md:mt-0 text-center md:text-right">
          {footer.copyrightText}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
