# app/config.py
import os

# Mongo
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "crime_db")

# FAISS files
FAISS_CASE_INDEX_PATH = os.getenv("FAISS_CASE_INDEX_PATH", "app/faiss_index/case.index")
FAISS_SUSPECT_INDEX_PATH = os.getenv("FAISS_SUSPECT_INDEX_PATH", "app/faiss_index/suspect.index")
# Single map file to link FAISS index IDs to MongoDB IDs (for simplicity)
FAISS_MAP_PATH = os.getenv("FAISS_MAP_PATH", "app/faiss_index/index_map.json")

# Embedding model
EMBED_MODEL_NAME = os.getenv("EMBED_MODEL_NAME", "all-MiniLM-L6-v2")
EMBED_DIM = int(os.getenv("EMBED_DIM", "384"))

# Other
TOP_K = int(os.getenv("TOP_K", "5"))