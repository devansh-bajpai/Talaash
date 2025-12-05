# app/services/stringEncoder.py
from sentence_transformers import SentenceTransformer
import numpy as np
from app.config import EMBED_MODEL_NAME
from typing import List

# Global variable to hold the heavy model instance (singleton pattern without a class)
_EMBEDDING_MODEL = None

def load_model():
    """Initializes the Sentence Transformer model into the global variable."""
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None:
        _EMBEDDING_MODEL = SentenceTransformer(EMBED_MODEL_NAME)
        
def encode_strings(texts: List[str]) -> np.ndarray:
    """Encodes a list of strings into a NumPy array of embeddings using the global model."""
    if _EMBEDDING_MODEL is None:
        load_model() # Load if somehow missed during startup
    return _EMBEDDING_MODEL.encode(texts)

def string_to_array(string: str) -> np.ndarray:
    """Encodes a single string into a vector embedding (1x384 NumPy array)."""
    return encode_strings([string])