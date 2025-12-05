from app.services.stringEncoder import string_to_array
from app.models.case_model import SuspectDoc
from app.db.db import suspects_col
from app.utils.index_controller import add_to_index, search_index, index_map_add, index_map_get_ids
from app.config import TOP_K, FAISS_SUSPECT_INDEX_PATH
from bson import ObjectId
from typing import List

async def add_suspect_to_system(suspect_data: SuspectDoc) -> SuspectDoc:
    """
    Encodes, inserts into MongoDB, and indexes the suspect in FAISS.
    """
    # 1. Encode text
    embedding = string_to_array(suspect_data.profile_text)
    suspect_data.embedding = embedding[0].tolist()

    # Prepare data for MongoDB
    data_to_insert = suspect_data.model_dump(exclude_none=True, by_alias=True)
        
    # 2. Insert into MongoDB
    result = suspects_col().insert_one(data_to_insert)
    suspect_id = str(result.inserted_id)
    suspect_data._id = suspect_id

    # 3. Add to FAISS and update ID map
    faiss_index_id = add_to_index(embedding, FAISS_SUSPECT_INDEX_PATH)
    index_map_add(faiss_index_id, suspect_id)

    return suspect_data

async def find_similar_suspects(query_text: str) -> List[SuspectDoc]:
    """
    Searches FAISS for similar suspects and retrieves full documents from MongoDB.
    """
    # 1. Encode query
    query_embedding = string_to_array(query_text)

    # 2. Search FAISS
    distances, faiss_indices = search_index(query_embedding, TOP_K, FAISS_SUSPECT_INDEX_PATH)

    if faiss_indices.size == 0 or faiss_indices.flatten()[0] < 0:
        return []

    # 3. Map indices to MongoDB IDs
    mongo_ids = index_map_get_ids(faiss_indices)

    # 4. Retrieve documents from MongoDB
    object_ids = [ObjectId(mid) for mid in mongo_ids]
    results = list(suspects_col().find({"_id": {"$in": object_ids}}))

    # Re-order and enrich results
    id_to_result = {str(res["_id"]): res for res in results}
    ranked_results = []
    
    for i, mongo_id in enumerate(mongo_ids):
        if mongo_id in id_to_result:
            suspect = id_to_result[mongo_id]
            suspect["distance"] = distances.flatten()[i]
            ranked_results.append(SuspectDoc(**suspect))

    return ranked_results