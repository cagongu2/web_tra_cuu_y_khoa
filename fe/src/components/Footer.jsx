import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="bg-white border-t text-sm text-gray-700 mt-10">
        <div className="max-w-[1130px] mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Cột 1: Thông tin công ty */}
          <div className="space-y-2 md:col-span-2">
            <h3 className="font-semibold uppercase text-black">
              ---------------------
            </h3>
            <p>
              <strong>VPĐD:</strong> --------------------- TP. HCM
            </p>
            <p>
              <strong>Hotline:</strong>{" "}
              <span className="text-blue-600 font-semibold">-------</span> |
              8:00 - 17:30 (T2 đến T7)
            </p>
            <p>
              Số ĐKKD ------- do Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh cấp
              lần đầu ngày -------
            </p>
            <p>
              Chịu trách nhiệm nội dung:{" "}
              <a href="#" className="text-blue-600 hover:underline">
                -------
              </a>
            </p>
            <div className="mt-4">
              <h4 className="font-semibold">Kết nối với chúng tôi</h4>
              <div className="flex space-x-3 mt-2">
                <a href="#">
                  <img
                    src="/icons/facebook.svg"
                    alt="Facebook"
                    className="w-5 h-5"
                  />
                </a>
                <a href="#">
                  <img
                    src="/icons/linkedin.svg"
                    alt="LinkedIn"
                    className="w-5 h-5"
                  />
                </a>
                <a href="#">
                  <img
                    src="/icons/youtube.svg"
                    alt="YouTube"
                    className="w-5 h-5"
                  />
                </a>
                <a href="#">
                  <img src="/icons/zalo.svg" alt="Zalo" className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Cột 2: Về YouMed */}
          <div className="space-y-2">
            <h4 className="font-semibold text-black">Về -------</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Về Tin Y Tế -------
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Ban Điều Hành -------
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Hội Đồng Tham Vấn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Đội Ngũ Biên Tập
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Dịch vụ */}
          <div className="space-y-2">
            <h4 className="font-semibold text-black">Dịch vụ</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Đặt khám Bác sĩ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Đặt khám Bệnh viện
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Đặt khám Phòng khám
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Hỗ trợ */}
          <div className="space-y-2">
            <h4 className="font-semibold text-black">Hỗ trợ</h4>
            <ul className="space-y-1">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Chính Sách Biên Tập
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Chính Sách Quảng Cáo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Chính Sách Bảo Mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Điều Khoản Sử Dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Liên Hệ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng dưới cùng */}
        <div className="max-w-[1130px] mx-auto border-t border-gray-200 pt-6 pb-4 px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p className="text-center md:text-left">
            Các thông tin trên ------- chỉ dành cho mục đích tham khảo, tra cứu
            và không thay thế cho việc chẩn đoán hoặc điều trị y khoa. Cần tuyệt
            đối tuân theo hướng dẫn của Bác sĩ và Nhân viên y tế.
          </p>
          <p className="mt-2 md:mt-0">
            Copyright © 2018 - 2025 -------------------------------------.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
