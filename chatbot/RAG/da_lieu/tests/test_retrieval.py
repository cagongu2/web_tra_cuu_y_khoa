import sys
import os
# Force UTF-8 encoding for Windows terminal
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Ensure project root is in path
sys.path.append(r'd:\web_tra_cuu_y_khoa\chatbot')

import faiss
import pickle
import numpy as np
from dotenv import load_dotenv
from modules.embedding import RotatingEmbeddings

# Load environment variables
load_dotenv(dotenv_path='d:/web_tra_cuu_y_khoa/chatbot/.env')

# Configuration
FAISS_DIR = os.getenv('faiss_path', r'd:\web_tra_cuu_y_khoa\chatbot\data_resource\faiss_index_8529')
INDEX_FILE = os.path.join(FAISS_DIR, 'index.faiss')
METADATA_FILE = os.path.join(FAISS_DIR, 'metadata.pkl')

# Get API keys
raw_keys = os.getenv('api_key')
import ast
api_keys = ast.literal_eval(raw_keys) if raw_keys.startswith('[') else [raw_keys]

def test_retrieval(query_text: str, k=3):
    print(f"\nQuery: {query_text}")
    
    # 1. Load FAISS Index
    index = faiss.read_index(INDEX_FILE)
    
    # 2. Load Metadata
    with open(METADATA_FILE, 'rb') as f:
        chunks = pickle.load(f)
        
    # 3. Initialize Embedder
    embedder = RotatingEmbeddings(api_keys=api_keys)
    
    # 4. Embed Query
    query_vector = embedder.embed_query(query_text)
    query_vector = np.array([query_vector]).astype('float32')
    
    # 5. Search
    distances, indices = index.search(query_vector, k)
    
    # 6. Show Results
    print(f"Top {k} results:")
    for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
        if idx < len(chunks):
            chunk = chunks[idx]
            print(f"\nResult {i+1} (Dist: {dist:.4f})")
            print(f"ID: {chunk['id']}")
            print(f"Disease: {chunk['metadata']['disease_name']}")
            print(f"Section: {chunk['metadata']['section_title']}")
            snippet = chunk['text'].split("\n\n")[-1][:200] + "..."
            print(f"Snippet: {snippet}")
        else:
            print(f"⚠️ Index {idx} out of range for chunks list.")

if __name__ == "__main__":
    # Sample Test Queries
    test_retrieval("Cách điều trị bệnh chốc ở trẻ em?")
    test_retrieval("Nguyên nhân gây bệnh nhọt")
    test_retrieval("Lupus ban đỏ hệ thống là gì?")
