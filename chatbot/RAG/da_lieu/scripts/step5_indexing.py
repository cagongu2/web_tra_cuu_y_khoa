import json
import os
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
    print("🚀 Starting Embedding and Vector DB Creation...")
    
    # 1. Load Chunks
    with open(CHUNKS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    chunks = data['chunks']
    texts = [c['text'] for c in chunks]
    metadatas = [c['metadata'] for c in chunks]
    
    print(f"📦 Loaded {len(texts)} chunks.")

    # 2. Initialize Embedder
    embedder = RotatingEmbeddings(api_keys=api_keys)
    
    # 3. Generate Embeddings
    print("🧠 Generating embeddings (this may take a while depending on quota)...")
    embeddings = embedder.embed_documents(texts)
    embeddings = np.array(embeddings).astype('float32')
    
    print(f"✅ Generated {embeddings.shape[0]} embeddings with dimension {embeddings.shape[1]}.")

    # 4. Create FAISS Index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    
    # 5. Save everything
    if not os.path.exists(FAISS_DIR):
        os.makedirs(FAISS_DIR)
        
    faiss.write_index(index, INDEX_FILE)
    
    # Save metadata mapping
    with open(METADATA_FILE, 'wb') as f:
        pickle.dump(chunks, f)
        
    print(f"🎉 FAISS DB saved successfully to {FAISS_DIR}")

if __name__ == "__main__":
    # Ensure we are in the right directory to import modules
    import sys
    sys.path.append(r'd:\web_tra_cuu_y_khoa\chatbot')
    create_vector_db()
