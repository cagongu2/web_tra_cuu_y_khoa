#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script để chuyển đổi diseases_list.md sang JSON chuẩn hóa
"""

import json
import re
from typing import Dict, List, Any
from pathlib import Path


class DiseaseParser:
    def __init__(self, md_file_path: str):
        self.md_file_path = Path(md_file_path)
        self.chapters = []
        self.current_chapter = None
        self.current_disease = None
        self.current_section = None
        
    def parse(self) -> Dict[str, Any]:
        """Parse toàn bộ file markdown"""
        with open(self.md_file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Phát hiện chương mới
            if self._is_chapter_header(line):
                self._save_current_disease()
                self._save_current_chapter()
                self._start_new_chapter(line)
            
            # Phát hiện bệnh mới
            elif self._is_disease_header(line, lines, i):
                self._save_current_disease()
                disease_name = line
                disease_name_en = ""
                if i + 1 < len(lines) and lines[i + 1].strip().startswith('('):
                    disease_name_en = lines[i + 1].strip().strip('()')
                    i += 1
                self._start_new_disease(disease_name, disease_name_en)
            
            # Phát hiện section mới (1. ĐẠI CƯƠNG, 2. NGUYÊN NHÂN, ...)
            elif self._is_section_header(line):
                self._save_current_section()
                self._start_new_section(line)
            
            # Thu thập nội dung
            elif self.current_section is not None and line:
                self.current_section['content'].append(line)
            
            i += 1
        
        # Lưu dữ liệu cuối cùng
        self._save_current_section()
        self._save_current_disease()
        self._save_current_chapter()
        
        return self._build_json_structure()
    
    def _is_chapter_header(self, line: str) -> bool:
        """Kiểm tra xem dòng có phải tiêu đề chương không"""
        # Pattern: ## CHƯƠNG 1. TÊN CHƯƠNG
        pattern = r'^##\s*CH[UƯ]ƠNG\s+\d+'
        return bool(re.match(pattern, line, re.IGNORECASE))
    
    def _is_disease_header(self, line: str, lines: List[str], index: int) -> bool:
        """Kiểm tra xem dòng có phải tên bệnh không"""
        # Tên bệnh thường là chữ in hoa, không có số đầu dòng
        # và dòng tiếp theo thường là tên tiếng Anh trong ngoặc
        if not line or line[0].isdigit():
            return False
        
        # Kiểm tra xem có phải toàn chữ hoa không
        if line.isupper() and len(line) > 3:
            # Kiểm tra dòng tiếp theo có phải tên tiếng Anh không
            if index + 1 < len(lines):
                next_line = lines[index + 1].strip()
                if next_line.startswith('(') and next_line.endswith(')'):
                    return True
            return True
        
        return False
    
    def _is_section_header(self, line: str) -> bool:
        """Kiểm tra xem dòng có phải tiêu đề mục không"""
        # Pattern: 1. ĐẠI CƯƠNG, 2. NGUYÊN NHÂN, ...
        pattern = r'^\d+\.\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]'
        return bool(re.match(pattern, line))
    
    def _start_new_chapter(self, line: str):
        """Bắt đầu chương mới"""
        # Extract chapter number and name
        match = re.match(r'##\s*CH[UƯ]ƠNG\s+(\d+)\.\s*(.+)', line, re.IGNORECASE)
        if match:
            chapter_num = int(match.group(1))
            chapter_name = match.group(2).strip()
            
            self.current_chapter = {
                'chapter_id': f'chapter_{chapter_num:02d}',
                'chapter_number': chapter_num,
                'chapter_name': self._normalize_text(chapter_name),
                'chapter_name_english': '',
                'diseases': []
            }
    
    def _start_new_disease(self, disease_name: str, disease_name_en: str):
        """Bắt đầu bệnh mới"""
        if self.current_chapter is None:
            return
        
        disease_id = f"disease_{self.current_chapter['chapter_number']:02d}_{len(self.current_chapter['diseases']) + 1:03d}"
        
        self.current_disease = {
            'disease_id': disease_id,
            'disease_name': self._normalize_text(disease_name),
            'disease_name_english': disease_name_en,
            'disease_name_latin': disease_name_en,
            'sections': {},
            'metadata': {
                'keywords': []
            }
        }
    
    def _start_new_section(self, line: str):
        """Bắt đầu section mới"""
        # Extract section number and title
        match = re.match(r'^(\d+)\.\s+(.+)', line)
        if match:
            section_num = match.group(1)
            section_title = match.group(2).strip()
            
            section_key = self._get_section_key(section_title)
            
            self.current_section = {
                'number': section_num,
                'title': section_title,
                'key': section_key,
                'content': []
            }
    
    def _get_section_key(self, title: str) -> str:
        """Chuyển đổi tiêu đề section thành key"""
        title_upper = title.upper()
        
        mapping = {
            'ĐẠI CƯƠNG': 'overview',
            'ĐỊNH NGHĨA': 'definition',
            'NGUYÊN NHÂN': 'etiology',
            'CĂN NGUYÊN': 'etiology',
            'BỆNH SINH': 'pathophysiology',
            'TRIỆU CHỨNG': 'clinical_manifestations',
            'LÂM SÀNG': 'clinical_manifestations',
            'CHẨN ĐOÁN': 'diagnosis',
            'ĐIỀU TRỊ': 'treatment',
            'BIẾN CHỨNG': 'complications',
            'TIẾN TRIỂN': 'prognosis',
            'PHÒNG BỆNH': 'prevention',
            'PHÕNG BỆNH': 'prevention',  # Lỗi font
            'TƢ VẤN': 'counseling',
            'TƯ VẤN': 'counseling'
        }
        
        for key_vn, key_en in mapping.items():
            if key_vn in title_upper:
                return key_en
        
        # Default: tạo key từ title
        return re.sub(r'[^a-z0-9]+', '_', title.lower()).strip('_')
    
    def _save_current_section(self):
        """Lưu section hiện tại vào disease"""
        if self.current_section and self.current_disease:
            section_key = self.current_section['key']
            content = '\n'.join(self.current_section['content'])
            
            self.current_disease['sections'][section_key] = {
                'title': self.current_section['title'],
                'content': self._normalize_text(content)
            }
            self.current_section = None
    
    def _save_current_disease(self):
        """Lưu bệnh hiện tại vào chương"""
        if self.current_disease and self.current_chapter:
            self.current_chapter['diseases'].append(self.current_disease)
            self.current_disease = None
    
    def _save_current_chapter(self):
        """Lưu chương hiện tại"""
        if self.current_chapter:
            self.chapters.append(self.current_chapter)
            self.current_chapter = None
    
    def _normalize_text(self, text: str) -> str:
        """Chuẩn hóa text: loại bỏ ký tự lỗi, khoảng trắng thừa"""
        # Loại bỏ ký tự lỗi font
        text = re.sub(r'\(cid:\d+\)', '', text)
        # Loại bỏ \r
        text = text.replace('\r', '')
        # Chuẩn hóa khoảng trắng: thay thế nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _build_json_structure(self) -> Dict[str, Any]:
        """Tạo cấu trúc JSON cuối cùng"""
        total_diseases = sum(len(chapter['diseases']) for chapter in self.chapters)
        
        return {
            'medical_diseases': {
                'chapters': self.chapters
            },
            'metadata': {
                'total_chapters': len(self.chapters),
                'total_diseases': total_diseases,
                'source': 'diseases_list.md',
                'created_date': '2026-01-24',
                'version': '1.0',
                'description': 'Cơ sở dữ liệu bệnh da liễu đã được chuẩn hóa cho hệ thống RAG y khoa'
            }
        }


def main():
    """Main function"""
    input_file = r'd:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\02_intermediate\diseases_list.md'
    output_file = r'd:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\02_intermediate\diseases_list.json'
    
    print(f"Đang parse file: {input_file}")
    parser = DiseaseParser(input_file)
    data = parser.parse()
    
    print(f"\nKết quả:")
    print(f"- Số chương: {data['metadata']['total_chapters']}")
    print(f"- Số bệnh: {data['metadata']['total_diseases']}")
    
    print(f"\nĐang ghi file JSON: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Hoàn thành! File đã được lưu tại: {output_file}")
    
    # In thông tin chi tiết
    print(f"\n📊 Chi tiết các chương:")
    for chapter in data['medical_diseases']['chapters']:
        print(f"  - Chương {chapter['chapter_number']}: {chapter['chapter_name']} ({len(chapter['diseases'])} bệnh)")


if __name__ == '__main__':
    main()
