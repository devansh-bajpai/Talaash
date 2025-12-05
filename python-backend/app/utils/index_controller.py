# app/utils/index_controller.py
import faiss
import numpy as np
import json
import os
import logging
from app.config import FAISS_MAP_PATH, EMBED_DIM
from typing import Tuple, List

# --- Index Management ---

def _initialize_faiss_index(path: str) -> faiss.Index:
    """Initializes and returns a new FAISS IndexFlatL2."""
    logging.info(f"Initializing new FAISS index at {path}.")
    faiss_dir = os.path.dirname(path)
    os.makedirs(faiss_dir, exist_ok=True)
    return faiss.IndexFlatL2(EMBED_DIM)

def get_index(path: str) -> faiss.Index:
    """Loads FAISS index from disk or creates a new one if file is missing."""
    if not os.path.exists(path):
        return _initialize_faiss_index(path)
    try:
        index = faiss.read_index(path)
        return index
    except Exception as e:
        logging.error(f"Failed to read FAISS index at {path}, creating new one: {e}")
        return _initialize_faiss_index(path)

def add_to_index(embedding: np.ndarray, path: str) -> int:
    """Adds an embedding to the specified FAISS index and saves it."""
    index = get_index(path)
    embedding_f32 = embedding.astype('float32')
    original_size = index.ntotal
    index.add(embedding_f32)
    faiss.write_index(index, path)
    
    new_index_id = original_size
    return new_index_id

def search_index(embedding: np.ndarray, k: int, path: str) -> Tuple[np.ndarray, np.ndarray]:
    """Searches the specified FAISS index for the top k most similar vectors."""
    index = get_index(path)
    
    if index.ntotal == 0:
        return np.array([[]]), np.array([[-1]]) # Return -1 to signify empty index
        
    distances, idx = index.search(embedding.astype('float32'), k)
    return distances, idx

# --- ID Map Management (Maps FAISS Index ID -> MongoDB _id) ---

def _load_index_map() -> dict:
    """Loads the FAISS index_id (int) -> MongoDB _id (str) map from JSON."""
    if not os.path.exists(FAISS_MAP_PATH):
        return {}
    try:
        with open(FAISS_MAP_PATH, 'r') as f:
            str_map = json.load(f)
            # Convert string keys back to integers
            return {int(k): v for k, v in str_map.items()}
    except Exception as e:
        logging.error(f"Failed to load index map, returning empty map: {e}")
        return {}

def _save_index_map(index_map: dict):
    """Saves the FAISS index_id -> MongoDB _id map to JSON."""
    # Convert integer keys to strings for JSON saving
    str_map = {str(k): v for k, v in index_map.items()}
    with open(FAISS_MAP_PATH, 'w') as f:
        json.dump(str_map, f, indent=4)

def index_map_add(faiss_index_id: int, mongo_id: str):
    """Adds a new mapping and saves the file."""
    index_map = _load_index_map()
    index_map[faiss_index_id] = mongo_id
    _save_index_map(index_map)

def index_map_get_ids(faiss_indices: np.ndarray) -> List[str]:
    """Converts a numpy array of FAISS indices to a list of MongoDB _ids."""
    index_map = _load_index_map()
    flat_indices = faiss_indices.flatten().tolist()
    
    mongo_ids = []
    for index in flat_indices:
        # Check if the index is valid (FAISS returns -1 for empty search slots)
        if index >= 0 and index in index_map:
            mongo_ids.append(index_map[index])
    
    return mongo_ids