import React from "react";

export const Home = () => {
  const healthEducationArticles = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
      title: "Dấu hiệu trên da tưởng vô hại lại là 'tiếng chuông' cảnh báo mắc HIV",
      description: "(BSJPL) - Không ít ca HIV được phát hiện khi người bệnh đã khám da liễu. Các dấu hiệu ngoài da đối khi là 'chuông báo động' sớm của bệnh Trước đây, khi nhắc đến HIV/AIDS, dư luận vẫn hồi thường mặc định sân bệnh này giấp...",
      tag: "ĐỌC THÊM"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
      title: "Giám đốc BV Đa liệu chỉ ra sai lầm 'uống nước làm mượt da trong mùa đông'",
      description: "Mùa thu, đông mát là khoảng thời gian nhiều người cho rằng cần uống nhiều nước nhằm duy trì độ ẩm do ảnh hưởng của không khí hanh khô, ô nhiễm. Nhiều người cho rằng chỉ cần uống đủ nước thì da sẽ mềm mượt.Bên lề lễ ra mắt ứng dụng IDS sao khỏe, PGS.TS...",
      tag: "ĐỌC THÊM",
      badge: "HOT"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400",
      title: "Tăng nặng bệnh viêm da cơ địa trong mùa lạnh",
      description: "Những ngày nắy thời tiết miền Bắc thường trở lạnh vào sáng sớm và chiều muộn, độ ẩm tháp, hanh khô. Đây là một trong những yếu tố làm gia tăng các bệnh lý về da như viêm da cơ địa, viêm các biểu hiện nhu bong tóc, khô, ngứa da tay,...",
      tag: "ĐỌC THÊM"
    }
  ];

  const medicineArticles = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
      title: "Thuốc Bilaxten 10mg (VN-BIL-112023-012) dành cho trẻ em",
      description: "1. Thành phần của Thuốc Bilaxten 10mg Mỗi viên nén phân tán trong miệng chứa 10 mg Bilastine 2. Chỉ định Thuốc Bilaxten chỉ định điều trị cho trẻ từ 6 đến 11 tuổi có cân nặng từ 20 kg trở lên: Điều trị triệu chứng trong trường hợp...",
      tag: "ĐỌC THÊM"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400",
      title: "TOA: Cập nhật cánh bao về nguy cơ rối loạn tâm thần và rối loạn tinh dục liên quan đến isotretinoin",
      description: "Isotretinoin (Biệt dược: Roaccutane) là thuốc kê đơn dùng trong điều trị mun trứng cá nghiêm trọng khi không đáp ứng với các liệu pháp điều trị khác. Thông tin bổ sung liên quan đến các nguy cơ tiềm ẩn đã xác định trước...",
      tag: "ĐỌC THÊM"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
      title: "Hiểu quả sử dụng calcipotriol đối với bệnh nhân vảy nến",
      description: "1. Tên hoạt chất Calcipotriol (hoặc calcipotriene) là một dẫn chất tổng hợp của calcitriol, hay còn gọi là vitamin D3, có tác dụng điều trị vảy nến. Nó được cấp bằng sáng chế vào năm 1985 và được chấp thuận cho sử dụng trong y học...",
      tag: "ĐỌC THÊM"
    }
  ];

  const ArticleCard = ({ article, showBadge = false }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-48 object-cover"
        />
        {showBadge && article.badge && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            {article.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.description}
        </p>
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
          {article.tag}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 w-full text-sm text-gray-700 py-8">
      {/* Section 1: Truyền thông giáo dục sức khỏe */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-8">
          TRUYỀN THÔNG GIÁO DỤC SỨC KHỎE
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {healthEducationArticles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              showBadge={true}
            />
          ))}
        </div>
        <div className="text-center">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
            Xem thêm
          </button>
        </div>
      </div>

      {/* Section 2: Thông tin thuốc */}
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-8">
          THÔNG TIN THUỐC
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {medicineArticles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article}
            />
          ))}
        </div>
        <div className="text-center">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
            Xem thêm
          </button>
        </div>
      </div>
    </div>
  );
};