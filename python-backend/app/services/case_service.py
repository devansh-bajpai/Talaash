from app.services.stringEncoder import string_to_array
from app.models.case_model import CaseDoc
from app.db.db import cases_col
from app.utils.index_controller import add_to_index, search_index, index_map_add, index_map_get_ids
from app.config import TOP_K, FAISS_CASE_INDEX_PATH
from bson import ObjectId
from typing import List

async def add_case_to_system(case_data: CaseDoc) -> CaseDoc:
    """
    Encodes, inserts into MongoDB, and indexes the case in FAISS.
    """
    # 1. Encode text
    embedding = string_to_array(case_data.case_text)
    case_data.embedding = embedding[0].tolist()

    # Prepare data for MongoDB
    data_to_insert = case_data.model_dump(exclude_none=True, by_alias=True)
        
    # 2. Insert into MongoDB
    result = cases_col().insert_one(data_to_insert)
    case_id = str(result.inserted_id)
    case_data._id = case_id

    # 3. Add to FAISS and update ID map
    faiss_index_id = add_to_index(embedding, FAISS_CASE_INDEX_PATH)
    index_map_add(faiss_index_id, case_id)

    return case_data

async def find_similar_cases(query_text: str) -> List[CaseDoc]:
    """
    Searches FAISS for similar cases and retrieves full documents from MongoDB.
    """
    # 1. Encode query
    query_embedding = string_to_array(query_text)

    # 2. Search FAISS
    distances, faiss_indices = search_index(query_embedding, TOP_K, FAISS_CASE_INDEX_PATH)

    if faiss_indices.size == 0 or faiss_indices.flatten()[0] < 0:
        return []

    # 3. Map indices to MongoDB IDs
    mongo_ids = index_map_get_ids(faiss_indices)

    # 4. Retrieve documents from MongoDB
    object_ids = [ObjectId(mid) for mid in mongo_ids]
    results = list(cases_col().find({"_id": {"$in": object_ids}}))

    # Re-order and enrich results
    id_to_result = {str(res["_id"]): res for res in results}
    ranked_results = []
    
    for i, mongo_id in enumerate(mongo_ids):
        if mongo_id in id_to_result:
            case = id_to_result[mongo_id]
            case["distance"] = distances.flatten()[i]
            # Use CaseDoc(**case) to correctly handle field aliases and validation
            ranked_results.append(CaseDoc(**case))

    return ranked_results

async def update_case_with_suspect(case_id: str, ground_truth_suspect: str):
    """Updates a case with the confirmed culprit."""
    try:
        object_id = ObjectId(case_id)
    except Exception:
        raise ValueError("Invalid Case ID format")

    result = cases_col().update_one(
        {"_id": object_id},
        {"$set": {"ground_truth_suspect": ground_truth_suspect}}
    )
    return result