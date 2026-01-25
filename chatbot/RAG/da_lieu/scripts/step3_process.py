#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script mở rộng thuật ngữ y khoa trong nội dung bệnh
Chiến lược: Mở rộng lần đầu xuất hiện trong mỗi section
"""

import json
import re
from typing import Dict, List, Any, Set, Tuple
from pathlib import Path


class DiseaseEnricher:
    def __init__(self, diseases_file: str, glossary_normalized_file: str):
        self.diseases_file = Path(diseases_file)
        self.glossary_file = Path(glossary_normalized_file)
        self.acronym_map = {}
        self.regex_patterns = {}
        
    def load_data(self):
        """Đọc dữ liệu"""
        # Load diseases
        with open(self.diseases_file, 'r', encoding='utf-8') as f:
            self.diseases_data = json.load(f)
        
        # Load normalized glossary
        with open(self.glossary_file, 'r', encoding='utf-8') as f:
            glossary = json.load(f)
            self.acronym_map = glossary['acronym_map']
            self.regex_patterns = glossary['regex_patterns']
    
    def expand_acronym(self, acronym: str) -> str:
        """
        Mở rộng acronym thành full text
        Format: ACRONYM (Full Name – Vietnamese)
        """
        if acronym not in self.acronym_map:
            return acronym
        
        data = self.acronym_map[acronym]
        full_name = data['full_name']
        vietnamese = data['vietnamese']
        
        return f"{acronym} ({full_name} – {vietnamese})"
    
    def enrich_section_content(self, content: str) -> Tuple[str, Set[str]]:
        """
        Mở rộng thuật ngữ trong content
        Chiến lược: Chỉ mở rộng lần đầu xuất hiện
        
        Returns:
            enriched_content: Nội dung đã mở rộng
            acronyms_found: Set các acronym đã tìm thấy
        """
        enriched_content = content
        acronyms_found = set()
        expanded_in_section = set()  # Track đã mở rộng trong section này
        
        # Duyệt qua tất cả acronyms theo thứ tự độ dài giảm dần
        # (để tránh match partial, ví dụ: AIDS trước AID)
        sorted_acronyms = sorted(
            self.regex_patterns.keys(),
            key=lambda x: len(x),
            reverse=True
        )
        
        for acronym in sorted_acronyms:
            pattern = self.regex_patterns[acronym]
            
            # Tìm tất cả matches
            matches = list(re.finditer(pattern, enriched_content, re.IGNORECASE))
            
            if matches:
                acronyms_found.add(acronym)
                
                # Chỉ mở rộng lần đầu tiên
                if acronym not in expanded_in_section:
                    first_match = matches[0]
                    matched_text = first_match.group(0)
                    
                    # Tạo text mở rộng
                    expanded_text = self.expand_acronym(acronym)
                    
                    # Replace chỉ lần đầu tiên
                    enriched_content = (
                        enriched_content[:first_match.start()] +
                        expanded_text +
                        enriched_content[first_match.end():]
                    )
                    
                    expanded_in_section.add(acronym)
        
        return enriched_content, acronyms_found
    
    def enrich_disease(self, disease: Dict) -> Dict:
        """Mở rộng thuật ngữ cho một bệnh"""
        enriched_disease = disease.copy()
        all_acronyms_used = set()
        
        # Enrich mỗi section
        for section_key, section_data in disease.get('sections', {}).items():
            content = section_data.get('content', '')
            
            if content:
                enriched_content, acronyms_found = self.enrich_section_content(content)
                
                # Thêm enriched_content
                enriched_disease['sections'][section_key]['enriched_content'] = enriched_content
                
                # Thu thập acronyms
                all_acronyms_used.update(acronyms_found)
        
        # Tạo glossary_used
        glossary_used = []
        for acronym in sorted(all_acronyms_used):
            if acronym in self.acronym_map:
                glossary_used.append({
                    'acronym': acronym,
                    'full_name': self.acronym_map[acronym]['full_name'],
                    'vietnamese': self.acronym_map[acronym]['vietnamese']
                })
        
        enriched_disease['glossary_used'] = glossary_used
        
        return enriched_disease
    
    def enrich_all(self) -> Dict:
        """Mở rộng thuật ngữ cho tất cả bệnh"""
        self.load_data()
        
        enriched_data = self.diseases_data.copy()
        total_diseases = 0
        total_enriched = 0
        total_acronyms_found = 0
        
        for chapter in enriched_data['medical_diseases']['chapters']:
            for i, disease in enumerate(chapter['diseases']):
                total_diseases += 1
                enriched_disease = self.enrich_disease(disease)
                
                # Cập nhật disease
                chapter['diseases'][i] = enriched_disease
                
                # Thống kê
                if enriched_disease.get('glossary_used'):
                    total_enriched += 1
                    total_acronyms_found += len(enriched_disease['glossary_used'])
        
        # Cập nhật metadata
        enriched_data['metadata']['enrichment_stats'] = {
            'total_diseases': total_diseases,
            'diseases_with_acronyms': total_enriched,
            'total_acronyms_found': total_acronyms_found,
            'enrichment_date': '2026-01-24'
        }
        
        return enriched_data, {
            'total_diseases': total_diseases,
            'total_enriched': total_enriched,
            'total_acronyms_found': total_acronyms_found
        }
    
    def save(self, output_file: str):
        """Lưu kết quả"""
        enriched_data, stats = self.enrich_all()
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enriched_data, f, ensure_ascii=False, indent=2)
        
        return enriched_data, stats


def main():
    """Main function"""
    diseases_file = r'd:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\02_intermediate\diseases_list.json'
    glossary_file = r'd:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\03_processed\medical_glossary_normalized.json'
    output_file = r'd:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\03_processed\diseases_list_enriched.json'
    
    print("🔄 Đang mở rộng thuật ngữ trong nội dung bệnh...")
    enricher = DiseaseEnricher(diseases_file, glossary_file)
    result, stats = enricher.save(output_file)
    
    print(f"\nHoàn thành!")
    print(f"\nThống kê:")
    print(f"  - Tổng số bệnh: {stats['total_diseases']}")
    print(f"  - Bệnh có thuật ngữ: {stats['total_enriched']}")
    print(f"  - Tổng acronyms tìm thấy: {stats['total_acronyms_found']}")
    print(f"  - Tỷ lệ: {stats['total_enriched']/stats['total_diseases']*100:.1f}%")
    print(f"\nFile đã lưu: {output_file}")
    
    # In ví dụ
    print(f"\n📝 Ví dụ bệnh đã enrich:")
    for chapter in result['medical_diseases']['chapters'][:1]:
        for disease in chapter['diseases'][:1]:
            if disease.get('glossary_used'):
                print(f"\n  Bệnh: {disease['disease_name']}")
                print(f"  Thuật ngữ sử dụng: {len(disease['glossary_used'])}")
                for term in disease['glossary_used'][:3]:
                    print(f"    - {term['acronym']}: {term['vietnamese']}")
                
                # Show ví dụ enriched content
                for section_key, section_data in list(disease['sections'].items())[:1]:
                    if 'enriched_content' in section_data:
                        original = section_data['content'][:150]
                        enriched = section_data['enriched_content'][:200]
                        print(f"\n  Section: {section_data['title']}")
                        print(f"  Original: {original}...")
                        print(f"  Enriched: {enriched}...")
                break


if __name__ == '__main__':
    main()
