from sentence_transformers import SentenceTransformer

def stringToArray(string):
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embedding = model.encode([string]) # Returns nparray of 1x384
    return embedding