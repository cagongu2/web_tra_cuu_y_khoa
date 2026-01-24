"""
Script trích xuất nội dung từ PDF y khoa với yêu cầu:
1. Giữ tiêu đề chương
2. Giữ tên bệnh
3. Giữ số thứ tự mục
4. Giữ bullet, bảng thuốc
5. Sử dụng PDF parser giữ layout
"""

import pdfplumber
import re
from pathlib import Path
import json

def extract_pdf_with_layout(pdf_path, output_path):
    """
    Trích xuất PDF với việc giữ nguyên layout và cấu trúc
    """
    extracted_content = []
    
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Tổng số trang: {len(pdf.pages)}")
        
        for page_num, page in enumerate(pdf.pages, 1):
            print(f"Đang xử lý trang {page_num}...")
            
            # Trích xuất text với layout
            text = page.extract_text(layout=True)
            
            # Trích xuất bảng nếu có
            tables = page.extract_tables()
            
            page_data = {
                "page_number": page_num,
                "text": text,
                "tables": tables if tables else []
            }
            
            extracted_content.append(page_data)
    
    return extracted_content

def format_content_to_markdown(extracted_content):
    """
    Chuyển đổi nội dung đã trích xuất sang định dạng Markdown
    với việc giữ nguyên cấu trúc
    """
    markdown_lines = []
    markdown_lines.append("# Hướng dẫn chẩn đoán điều trị Da liễu\n")
    
    for page_data in extracted_content:
        page_num = page_data["page_number"]
        text = page_data["text"]
        tables = page_data["tables"]
        
        # Thêm text của trang
        if text:
            # Phát hiện tiêu đề chương (thường là chữ in hoa hoặc có số chương)
            lines = text.split('\n')
            for line in lines:
                line = line.strip()
                if not line:
                    markdown_lines.append("")
                    continue
                
                # Phát hiện tiêu đề chương (ví dụ: "CHƯƠNG 1", "Chương I")
                if re.match(r'^(CHƯƠNG|Chương)\s+[IVX\d]+', line, re.IGNORECASE):
                    markdown_lines.append(f"\n## {line}\n")
                # Phát hiện số thứ tự mục (1., 2., 1.1, a., etc.)
                elif re.match(r'^\d+\.(\d+\.)*\s+', line) or re.match(r'^[a-z]\.\s+', line):
                    markdown_lines.append(f"\n{line}")
                # Phát hiện bullet points (-, •, *, etc.)
                elif re.match(r'^[\-\•\*\+]\s+', line):
                    markdown_lines.append(f"{line}")
                else:
                    markdown_lines.append(line)
        
        # Thêm bảng nếu có
        if tables:
            for table_idx, table in enumerate(tables, 1):
                markdown_lines.append(f"\n### Bảng {table_idx} (Trang {page_num})\n")
                
                # Chuyển đổi bảng sang markdown
                if table and len(table) > 0:
                    # Header
                    header = table[0]
                    markdown_lines.append("| " + " | ".join([str(cell) if cell else "" for cell in header]) + " |")
                    markdown_lines.append("| " + " | ".join(["---" for _ in header]) + " |")
                    
                    # Rows
                    for row in table[1:]:
                        markdown_lines.append("| " + " | ".join([str(cell) if cell else "" for cell in row]) + " |")
                    
                    markdown_lines.append("")
    
    return "\n".join(markdown_lines)

def main():
    # Đường dẫn file
    pdf_path = Path(r"d:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\01_raw\Huong-dan-chan-doan-dieu-tri-Da-lieu.pdf")
    output_txt = Path(r"d:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\02_intermediate\Huong-dan-chan-doan-dieu-tri-Da-lieu.txt")
    output_md = Path(r"d:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\02_intermediate\diseases_list.md")
    output_json = Path(r"d:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\02_intermediate\pdf_raw.json")
    
    print("Bắt đầu trích xuất PDF...")
    
    # Trích xuất nội dung
    extracted_content = extract_pdf_with_layout(pdf_path, output_txt)
    
    # Lưu raw data dạng JSON
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(extracted_content, f, ensure_ascii=False, indent=2)
    print(f"Đã lưu dữ liệu JSON: {output_json}")
    
    # Chuyển đổi sang Markdown
    markdown_content = format_content_to_markdown(extracted_content)
    with open(output_md, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    print(f"Đã lưu file Markdown: {output_md}")
    
    # Lưu text thuần
    with open(output_txt, 'w', encoding='utf-8') as f:
        for page_data in extracted_content:
            f.write(f"\n{'='*80}\n")
            f.write(f"TRANG {page_data['page_number']}\n")
            f.write(f"{'='*80}\n\n")
            f.write(page_data['text'])
            f.write("\n")
    print(f"Đã lưu file text: {output_txt}")
    
    print("\nHoàn thành!")
    print(f"- File JSON (raw data): {output_json}")
    print(f"- File Markdown (có cấu trúc): {output_md}")
    print(f"- File Text (thuần): {output_txt}")

if __name__ == "__main__":
    main()
