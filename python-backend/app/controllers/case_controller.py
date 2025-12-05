from fastapi import APIRouter, Body, HTTPException
from app.db.db import cases_col
from app.services.case_service import add_case_to_system, find_similar_cases, update_case_with_suspect
from app.models.case_model import CaseDoc
from typing import List

router = APIRouter()

@router.post("/", response_model=CaseDoc)
async def create_case(case_data: CaseDoc = Body(...)):
    """
    Adds a new criminal case to the MongoDB and the FAISS index.
    """
    if not case_data.case_text:
        raise HTTPException(status_code=400, detail="Case text is required.")
        
    new_case = await add_case_to_system(case_data)
    return new_case

@router.post("/search")
async def search_cases(case_text: str = Body(..., embed=True)):
    """
    Performs a vector similarity search in FAISS using the input case text.
    """
    if not case_text:
        raise HTTPException(status_code=400, detail="Search text is required.")

    results = await find_similar_cases(case_text)
    return {"query": case_text, "results": results}

@router.put("/{case_id}/culprit")
async def set_culprit(case_id: str, ground_truth_suspect: str = Body(..., embed=True)):
    """
    Updates a case in the database after the culprit is confirmed.
    """
    result = await update_case_with_suspect(case_id, ground_truth_suspect)
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Case with ID {case_id} not found.")
    
    return {"message": f"Case {case_id} updated with culprit: {ground_truth_suspect}"}

@router.get("/", response_model=List[CaseDoc])
async def get_all_cases():
    """Retrieves all cases from MongoDB."""
    cases = list(cases_col().find({}))
    for case in cases:
        case['_id'] = str(case['_id'])
    return cases