import json
import time
import re
from typing import List

# =========================
# CONFIG
# =========================
INPUT_FILE = r'd:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\03_processed\diseases_list_enriched.json'
OUTPUT_FILE = r'd:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\04_output\semantic_chunks.json'

MAX_WORDS = 350
MIN_WORDS = 120
OVERLAP_WORDS = 50
PARAGRAPH_SPLIT_THRESHOLD = 200

GUARD_WORDS = ["Do đó", "Tuy nhiên", "Vì vậy", "Mặt khác"]

# =========================
# TEXT UTILITIES
# =========================
def clean_text(text: str) -> str:
    # Remove page numbers / noise like "12", "33 (Leprosy)"
    text = re.sub(r'\n?\s*\d+\s*\([^)]+\)\s*', ' ', text)
    text = re.sub(r'\n?\s*\d+\s*\n?', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def split_into_sentences(text: str) -> List[str]:
    # Safer Vietnamese sentence splitter (avoid mg., vs., etc.)
    pattern = r'(?<!\bmg)(?<!\bvs)(?<!\bDr)(?<!\bFig)(?<=[.!?])\s+'
    sentences = re.split(pattern, text)
    return [s.strip() for s in sentences if s.strip()]

def split_by_paragraph(text: str) -> List[str]:
    return [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]

# =========================
# CHUNK CREATION
# =========================
def create_chunks_for_section(disease_name: str, section_title: str, content: str) -> List[str]:
    header = f"Bệnh: {disease_name}\nMục: {section_title}\n\n"

    content = clean_text(content)
    paragraphs = split_by_paragraph(content)

    units = []
    for para in paragraphs:
        if len(para.split()) > PARAGRAPH_SPLIT_THRESHOLD:
            units.extend(split_into_sentences(para))
        else:
            units.append(para)

    # ---- Step 1: raw chunking (NO overlap yet)
    raw_chunks = []
    current_units = []
    current_words = 0

    for unit in units:
        w = len(unit.split())
        if current_words + w > MAX_WORDS and current_units:
            raw_chunks.append(" ".join(current_units))
            current_units = [unit]
            current_words = w
        else:
            current_units.append(unit)
            current_words += w

    if current_units:
        raw_chunks.append(" ".join(current_units))

    # ---- Step 2: guard-word merge
    guarded_chunks = []
    for chunk in raw_chunks:
        if any(chunk.startswith(g) for g in GUARD_WORDS) and guarded_chunks:
            guarded_chunks[-1] += " " + chunk
        else:
            guarded_chunks.append(chunk)

    # ---- Step 3: merge small chunks
    merged_chunks = []
    for chunk in guarded_chunks:
        if merged_chunks and len(chunk.split()) < MIN_WORDS:
            merged_chunks[-1] += " " + chunk
        else:
            merged_chunks.append(chunk)

    # ---- Step 4: re-split if guard merge exceeds MAX_WORDS
    final_chunks = []
    for chunk in merged_chunks:
        if len(chunk.split()) <= MAX_WORDS:
            final_chunks.append(chunk)
        else:
            sentences = split_into_sentences(chunk)
            temp = []
            temp_words = 0
            for s in sentences:
                sw = len(s.split())
                if temp_words + sw > MAX_WORDS and temp:
                    final_chunks.append(" ".join(temp))
                    temp = [s]
                    temp_words = sw
                else:
                    temp.append(s)
                    temp_words += sw
            if temp:
                final_chunks.append(" ".join(temp))

    # ---- Step 5: apply overlap (LAST STEP)
    overlapped = []
    for i, chunk in enumerate(final_chunks):
        if i == 0:
            overlapped.append(chunk)
        else:
            prev_words = final_chunks[i - 1].split()[-OVERLAP_WORDS:]
            overlapped.append(" ".join(prev_words) + " " + chunk)

    return [header + c.strip() for c in overlapped]

# =========================
# MAIN PROCESS
# =========================
def process_chunking():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    chunks = []
    chunk_id = 0

    chapters = data["medical_diseases"]["chapters"]

    for chapter in chapters:
        for disease in chapter["diseases"]:
            for section_key, section in disease["sections"].items():
                content = section.get("enriched_content") or section.get("content")
                if not content:
                    continue

                section_chunks = create_chunks_for_section(
                    disease["disease_name"],
                    section.get("title") or section_key,
                    content
                )

                for idx, text in enumerate(section_chunks, start=1):
                    pure_content = text.split("\n\n", 1)[-1]
                    chunks.append({
                        "id": f"chunk_{chunk_id:06d}",
                        "text": text,
                        "metadata": {
                            "chapter_id": chapter["chapter_id"],
                            "chapter_name": chapter["chapter_name"],
                            "disease_id": disease["disease_id"],
                            "disease_name": disease["disease_name"],
                            "disease_name_english": disease.get("disease_name_english"),
                            "section_key": section_key,
                            "section_title": section.get("title") or section_key,
                            "chunk_index": idx,
                            "total_chunks": len(section_chunks),
                            "word_count": len(pure_content.split()),
                            "language": section.get("language", "vi"),
                            "source": "textbook"
                        }
                    })
                    chunk_id += 1

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(
            {
                "chunks": chunks,
                "metadata": {
                    "total_chunks": len(chunks),
                    "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
                }
            },
            f,
            ensure_ascii=False,
            indent=2
        )

    print(f"Semantic chunking DONE — {len(chunks)} chunks created.")

if __name__ == "__main__":
    process_chunking()
