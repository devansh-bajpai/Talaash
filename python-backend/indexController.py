import faiss

def getIndex():
    index = faiss.read_index("data.index")
    return index

def addToIndex(embedding):
    index = getIndex()
    new_id = index.ntotal
    index.add(embedding)
    faiss.write_index(index, "data.index")
    return new_id

# search for a index
def searchIndex(embedding):
    index = getIndex()
    distances, idx = index.search(embedding, 5)
    return [idx, distances]