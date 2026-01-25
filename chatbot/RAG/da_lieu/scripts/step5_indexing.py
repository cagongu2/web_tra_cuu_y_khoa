import sys
import os
# Ensure project root is in path
sys.path.append(r'd:\web_tra_cuu_y_khoa\chatbot')

import json
import numpy as np
import faiss
import pickle
from dotenv import load_dotenv
from modules.embedding import RotatingEmbeddings

# Load environment variables
load_dotenv(dotenv_path='d:/web_tra_cuu_y_khoa/chatbot/.env')

# Configuration
CHUNKS_FILE = r'd:\web_tra_cuu_y_khoa\chatbot\RAG\da_lieu\data\04_output\semantic_chunks.json'
FAISS_DIR = os.getenv('faiss_path', r'd:\web_tra_cuu_y_khoa\chatbot\data_resource\faiss_index_8529')
INDEX_FILE = os.path.join(FAISS_DIR, 'index.faiss')
METADATA_FILE = os.path.join(FAISS_DIR, 'metadata.pkl')

# Get API keys for rotation
raw_keys = os.getenv('api_key')
if raw_keys:
    # Handle the string representation of list like "['key1', 'key2']"
    import ast
    api_keys = ast.literal_eval(raw_keys) if raw_keys.startswith('[') else [raw_keys]
else:
    raise ValueError("No API keys found in .env")

def create_vector_db():
    print("Starting Embedding and Vector DB Creation...")
    
    # 1. Load Chunks
    with open(CHUNKS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    all_chunks = data['chunks']
    
    # --- Deduplication logic ---
    print("Checking for duplicate chunks...")
    seen_hashes = set()
    unique_chunks = []
    duplicate_count = 0
    
    import hashlib
    for chunk in all_chunks:
        # Create a unique hash based on disease, section, and text content
        content_key = f"{chunk['metadata']['disease_id']}_{chunk['metadata']['section_key']}_{chunk['text']}"
        chunk_hash = hashlib.sha256(content_key.encode('utf-8')).hexdigest()
        
        if chunk_hash not in seen_hashes:
            seen_hashes.add(chunk_hash)
            unique_chunks.append(chunk)
        else:
            duplicate_count += 1
            
    if duplicate_count > 0:
        print(f"Warning: Found and removed {duplicate_count} duplicate chunks.")
    else:
        print("No duplicates found.")
        
    texts = [c['text'] for c in unique_chunks]
    metadatas = [c['metadata'] for c in unique_chunks]
    
    print(f"Processing {len(texts)} unique chunks.")

    # 2. Initialize Embedder
    embedder = RotatingEmbeddings(api_keys=api_keys)
    
    # 3. Generate Embeddings
    print("Generating embeddings (this may take a while depending on quota)...")
    embeddings = embedder.embed_documents(texts)
    embeddings = np.array(embeddings).astype('float32')
    
    print(f"Generated {embeddings.shape[0]} embeddings with dimension {embeddings.shape[1]}.")

    # 4. Create LangChain FAISS Index
    from langchain_community.vectorstores import FAISS
    from langchain_core.documents import Document
    
    print("Creating LangChain FAISS index...")
    documents = [
        Document(page_content=t, metadata=m) 
        for t, m in zip(texts, metadatas)
    ]
    
    # We initialize from texts and current embeddings
    # Using a workaround to avoid re-embedding since we already have them
    vector_store = FAISS.from_embeddings(
        text_embeddings=zip(texts, embeddings),
        embedding=embedder,
        metadatas=metadatas
    )
    
    # 5. Save everything
    if not os.path.exists(FAISS_DIR):
        os.makedirs(FAISS_DIR)
        
    vector_store.save_local(FAISS_DIR)
    
    print(f"FAISS DB (LangChain format) saved successfully to {FAISS_DIR}")

if __name__ == "__main__":
    # Ensure we are in the right directory to import modules
    import sys
    sys.path.append(r'd:\web_tra_cuu_y_khoa\chatbot')
    create_vector_db()
