import React from "react";
import { useParams } from "react-router-dom";

const mockApi = {
  id: 1,
  name: "Tra cứu bệnh",
  slug: "tra-cuu-benh",
  level: 0,
  parent_id: null,
  children: [
    { id: 2, name: "Răng - Hàm - Mặt", level: 2, parent_id: 1, slug: "rang-ham-mat", description: "Thông tin về các bệnh liên quan đến răng, hàm và mặt" },
    { id: 3, name: "Tai - Mũi - Họng", level: 2, parent_id: 1, slug: "tai-mui-hong", description: "Các bệnh thường gặp về tai, mũi, họng" },
    { id: 4, name: "Da liễu", level: 2, parent_id: 1, slug: "da-lieu", description: "Các vấn đề về da, dị ứng và viêm da" },
    { id: 5, name: "Nhãn khoa", level: 2, parent_id: 1, slug: "nhan-khoa", description: "Các bệnh về mắt và thị giác" },
    { id: 6, name: "Cơ Xương Khớp", level: 2, parent_id: 1, slug: "co-xuong-khop", description: "Thông tin về khớp, xương, cột sống" },
    { id: 7, name: "Dinh Dưỡng", level: 2, parent_id: 1, slug: "dinh-duong", description: "Chế độ ăn uống và dinh dưỡng hợp lý" },
    { id: 8, name: "Sức khỏe nam giới", level: 2, parent_id: 1, slug: "suc-khoe-nam-gioi", description: "Các bệnh lý thường gặp ở nam giới" },
    { id: 9, name: "Sức khoẻ nữ giới", level: 2, parent_id: 1, slug: "suc-khoe-nu-gioi", description: "Thông tin sức khoẻ dành cho nữ giới" },
    { id: 10, name: "Sức khỏe tình dục", level: 2, parent_id: 1, slug: "suc-khoe-tinh-duc", description: "Vấn đề về sinh lý và tình dục" },
    { id: 11, name: "Thần kinh", level: 2, parent_id: 1, slug: "than-kinh", description: "Thông tin về các bệnh thần kinh" },
    { id: 12, name: "Hô hấp", level: 2, parent_id: 1, slug: "ho-hap", description: "Bệnh về đường hô hấp" },
    { id: 13, name: "Dị ứng", level: 2, parent_id: 1, slug: "di-ung", description: "Nguyên nhân và điều trị dị ứng" },
    { id: 14, name: "Nội tiết", level: 2, parent_id: 1, slug: "noi-tiet", description: "Các rối loạn nội tiết và hormon" },
    { id: 15, name: "Tiêu hóa - Gan mật", level: 2, parent_id: 1, slug: "tieu-hoa-gan-mat", description: "Vấn đề về hệ tiêu hoá, gan, mật" },
    { id: 16, name: "Thận - Tiết niệu", level: 2, parent_id: 1, slug: "than-tiet-nieu", description: "Các bệnh lý về thận và hệ tiết niệu" },
    { id: 17, name: "Ung bướu", level: 2, parent_id: 1, slug: "ung-buou", description: "Thông tin về ung thư và u lành tính" },
    { id: 18, name: "Xét nghiệm", level: 2, parent_id: 1, slug: "xet-nghiem", description: "Các loại xét nghiệm y học phổ biến" },
    { id: 19, name: "Thể dục thể thao", level: 2, parent_id: 1, slug: "the-duc-the-thao", description: "Tập luyện thể chất, thể thao và sức khoẻ" },
    { id: 20, name: "Thực phẩm chức năng", level: 2, parent_id: 1, slug: "thuc-pham-chuc-nang", description: "Thông tin về thực phẩm bổ sung và chức năng" },
  ],
  description: "Danh mục tra cứu thông tin bệnh lý theo chuyên khoa",
};

export const SearchPage = () => {
  const { slug } = useParams();
  const parentCategory = mockApi; // Giả định là đúng slug

  // Khởi tạo các nhóm A-Z
  const groupedChildren = {};
  for (let i = 65; i <= 90; i++) {
    groupedChildren[String.fromCharCode(i)] = [];
  }

  // Nhóm các chuyên mục con theo chữ cái đầu tiên
  parentCategory.children.forEach((child) => {
    const firstChar = child.name.charAt(0).toUpperCase();
    if (groupedChildren[firstChar]) {
      groupedChildren[firstChar].push(child);
    }
  });

  if (!parentCategory) {
    return <div className="text-red-500 p-4">Danh mục không tồn tại.</div>;
  }

  return (
    <div className="bg-white w-full text-sm text-gray-700 mt-1">
      <div className="max-w-[1130px] mx-auto pt-4 px-4 text-left">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600">
          <a className="text-blue-500" href="/">Trang chủ</a>
        </div>

        {/* Tiêu đề */}
        <section className="pt-12">
          <h1 className="font-serif text-2xl md:text-4xl font-bold my-4">
            {parentCategory.name}
          </h1>
        </section>

        {/* Input + A-Z */}
        <section>
          <form>
            <div className="input-group flex flex-row gap-2">
              <input
                type="text"
                placeholder="Nhập thông tin"
                className="w-full py-3 px-6 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </form>

          <h2 className="font-bold text-lg my-2">Tìm theo bảng chữ cái</h2>

          <ul className="flex flex-wrap mb-4 gap-3">
            {Object.keys(groupedChildren).map((letter) => (
              <li key={letter} className="w-10 h-10">
                <button
                  onClick={() =>
                    document
                      .getElementById(`a-z-listing-letter-${letter}`)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-full h-full bg-slate-100 rounded"
                >
                  {letter}
                </button>
              </li>
            ))}
          </ul>

          {/* Danh sách chuyên mục theo chữ cái */}
          {Object.keys(groupedChildren).map((letter) => {
            const group = groupedChildren[letter];
            if (group.length === 0) return null;

            return (
              <div key={letter} className="mb-8" id={`a-z-listing-letter-${letter}`}>
                <h2 className="mb-4 font-semibold text-xl border-b border-gray-200">
                  {letter}
                </h2>
                <ul className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 text-base gap-2">
                  {group.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`/tin-tuc/${item.slug}`}
                        className="text-black hover:underline"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="text-right mt-2">
                  <a href={`#a-z-listing-letter-${letter}`} className="text-sm text-gray-500 hover:underline">
                    Back to top
                  </a>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};
