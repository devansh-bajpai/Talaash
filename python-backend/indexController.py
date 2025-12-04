import faiss

def getIndex():
    index = faiss.read_index("data.index")
    return index

def addToIndex(embedding):
    index = getIndex()
    index.add(embedding)
    faiss.write_index(index, "data.index")