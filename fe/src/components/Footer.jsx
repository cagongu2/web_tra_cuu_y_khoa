import React from "react";
import { FaFacebookSquare, FaTwitter, FaYoutube } from "react-icons/fa";

const data = {
  id: 1,
  company_name: "YouMed",
  company_full_name: "Công ty Cổ phần YouMed Việt Nam",
  company_description: "Hệ sinh thái chăm sóc sức khỏe toàn diện tại Việt Nam.",
  office_address: "Tòa nhà ABC, Quận 1, TP. Hồ Chí Minh",
  hotline: "1900 1234",
  email: "contact@youmed.vn",
  copyright_text: "Copyright © 2018 - 2025 YouMed. All rights reserved.",
  working_hours: "8:00 - 17:30 (T2 đến T7)",
  business_license:
    "Số ĐKKD 0312345678 do Sở KH&ĐT TP. Hồ Chí Minh cấp lần đầu ngày 01/01/2020",
  about_links: "Abc",
  service_links: "Abc",
  support_links: "Abc",
  facebook_url: "https://facebook.com/youmed",
  youtube_url: "https://youtube.com/youmed",
  twitter_url: "https://twitter.com/youmed",
};

const Footer = () => {
  return (
    <>
      <footer className="bg-white border-t border-gray-200 text-sm text-gray-700 mt-10 w-full">
        <div className="max-w-[1130px] mx-auto py-4 px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1: Thông tin công ty */}
          <div className="space-y-2 md:col-span-2">
            <h3 className="font-semibold uppercase text-black">
              {data.company_full_name}
            </h3>
            <p>
              <strong>VPĐD:</strong> {data.office_address}
            </p>
            <p>
              <strong>Hotline:</strong>{" "}
              <span className="text-blue-600 font-semibold">
                {data.hotline}
              </span>{" "}
              |{" " + data.working_hours}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              <span className="text-blue-600 font-semibold">{data.email}</span>
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-black">Về {data.company_name}</h4>
            <ul className="space-y-1">
              <li>
                <a href={data.about_links} className="hover:text-blue-600">
                  Về Chúng Tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Dịch Vụ {data.company_name} cung cấp
                </a>
              </li>
              <li>
                <a href={data.support_links} className="hover:text-blue-600">
                  Hướng Dẫn Sử Dụng
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Kết nối với chúng tôi</h4>
            <div className="flex space-x-3 mt-2">
              <a href={data.facebook_url}>
                <FaFacebookSquare />
              </a>
              <a href={data.youtube_url}>
                <FaYoutube />
              </a>
              <a href={data.twitter_url}>
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>

        {/* Dòng dưới cùng */}
        <div className="border-t border-gray-200 w-full"></div>
        <div className="max-w-[1130px] mx-auto pt-6 pb-4 px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p className="text-center md:text-left">
            Các thông tin trên {data.company_name} chỉ dành cho mục đích tham
            khảo, tra cứu và không thay thế cho việc chẩn đoán hoặc điều trị y
            khoa. Cần tuyệt đối tuân theo hướng dẫn của Bác sĩ và Nhân viên y
            tế.
          </p>
          <p className="mt-2 md:mt-0">
            Copyright © 2018 - 2025 {data.copyright_text}
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
