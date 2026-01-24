# 🏥 Quy trình Xử lý Dữ liệu RAG chuyên khoa Da liễu (PDF to FAISS)

Dự án này cung cấp một pipeline hoàn chỉnh từ file PDF y khoa thô đến cơ sở dữ liệu vector (FAISS) chuẩn ngữ cảnh, phục vụ cho Chatbot tra cứu chuyên khoa.

---

## 📁 Cấu trúc Thư mục

```text
da_lieu/
├── data/
│   ├── 01_raw/             # Chứa file PDF gốc từ Bộ Y tế.
│   ├── 02_intermediate/    # Dữ liệu trích xuất thô (Markdown/JSON) chưa qua xử lý.
│   ├── 03_processed/       # Dữ liệu đã được làm giàu (Enriched) và chuẩn hóa thuật ngữ.
│   └── 04_output/          # File Semantic Chunks cuối cùng sẵn sàng để nạp vào FAISS.
├── scripts/
│   ├── step1_extract.py    # Trích xuất PDF -> Markdown (giữ cấu trúc bảng, mục).
│   ├── step2_parse.py      # Chuyển đổi Markdown -> JSON phân cấp (Chương/Bệnh/Mục).
│   ├── step3_process.py    # Làm giàu dữ liệu (Enrich) bằng cách giải nghĩa thuật ngữ viết tắt.
│   ├── step4_chunking.py   # Chia nhỏ văn bản (Semantic Chunking) với header ngữ cảnh.
│   └── step5_indexing.py   # Tạo Embeddings và xây dựng FAISS Vector Index.
├── tests/
│   └── test_retrieval.py   # Script kiểm tra độ chính xác của kết quả truy xuất.
└── README.md               # Hướng dẫn này.
```

---

## 🚀 Hướng dẫn thực hiện từng bước

### Bước 0: Chuẩn bị môi trường
1. Cài đặt các thư viện cần thiết:
   ```bash
   pip install pdfplumber faiss-cpu numpy sentence-transformers google-generativeai python-dotenv
   ```
2. Cấu hình file `.env` tại thư mục gốc của chatbot:
   ```env
   api_key=['KEY_1', 'KEY_2']  # Danh sách API keys Gemini để xoay vòng
   faiss_path=d:/path/to/save/index
   ```

### Bước 1: Trích xuất PDF (`step1_extract.py`)
- **Mục tiêu**: Đọc file PDF `Huong-dan-chan-doan-dieu-tri-Da-lieu.pdf` và chuyển thành Markdown.
- **Phương pháp**: Sử dụng `pdfplumber` để giữ nguyên layout, Table và các Bullet points.
- **Output**: `data/02_intermediate/diseases_list.md`

### Bước 2: Parsing cấu trúc (`step2_parse.py`)
- **Mục tiêu**: Chuyển file Markdown thô thành cấu trúc JSON có phân cấp.
- **Cấu trúc**: `Chương -> Bệnh -> Các mục (Đại cương, Triệu chứng, Điều trị...)`.
- **Output**: `data/02_intermediate/diseases_list.json`

### Bước 3: Làm giàu dữ liệu & Chuẩn hóa (`step3_process.py`)
- **Mục tiêu**: Tự động tìm các từ viết tắt y khoa (ví dụ: `HSV`, `ALT`) và chèn thêm giải nghĩa (Full name + Vietnamese).
- **Lợi ích**: Giúp mô hình Embedding hiểu sâu hơn về nội dung chuyên môn.
- **Output**: `data/03_processed/diseases_list_enriched.json`

### Bước 4: Tạo Semantic Chunks (`step4_chunking.py`)
Đây là bước quan trọng nhất để đảm bảo chatbot không trả lời sai ngữ cảnh.
- **Header Injection**: Mỗi chunk đều được chèn header: `Bệnh: {Tên bệnh} | Mục: {Tên mục}`.
- **Guard Rules**: Tự động gộp các đoạn văn bắt đầu bằng từ nối (*"Do đó", "Tuy nhiên", "Vì vậy"*) vào đoạn trước để tránh mất logic khi chia nhỏ.
- **Kích thước**: Max 350 từ, Overlap 50 từ.
- **Output**: `data/04_output/semantic_chunks.json`

### Bước 5: Xây dựng Index (`step5_indexing.py`)
- **Mục tiêu**: Sử dụng Gemini API (`gemini-embedding-001`) để chuyển văn bản thành vector và lưu vào FAISS.
- **Kết quả**: Tạo ra file `index.faiss` và `metadata.pkl` tại đường dẫn cấu hình trong `.env`.

---

## 🔍 Kiểm tra kết quả
Sau khi tạo xong Index, chạy script test để kiểm tra:
```bash
python tests/test_retrieval.py
```
Nhập câu hỏi và xem hệ thống lấy ra các đoạn kiến thức có đúng với chuyên khoa Da liễu hay không.

---

## 💡 Lưu ý quan trọng
1. **Font chữ**: Script đã tích hợp bộ lọc sửa lỗi font Tiếng Việt (Ƣ/ƣ -> Ư/ư) thường gặp khi trích xuất từ PDF y khoa cũ.
2. **API Quota**: Nếu bạn có lượng dữ liệu lớn, hãy thêm nhiều API Keys vào file `.env` để script tự động xoay vòng (Rotating Embeddings).
3. **Metadata**: Luôn giữ metadata đầy đủ (Chapter ID, Disease ID) để phục vụ việc lọc dữ liệu (filtering) nâng cao sau này.
