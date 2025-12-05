from fastapi import APIRouter, Body, HTTPException
from app.models.case_model import SuspectDoc
from app.services.suspect_service import add_suspect_to_system, find_similar_suspects
from typing import List
from app.db.db import suspects_col

router = APIRouter()

@router.post("/", response_model=SuspectDoc)
async def create_suspect(suspect_data: SuspectDoc = Body(...)):
    """
    Adds a new suspect profile to MongoDB and FAISS.
    """
    if not suspect_data.profile_text:
        raise HTTPException(status_code=400, detail="Suspect profile text is required.")
        
    new_suspect = await add_suspect_to_system(suspect_data)
    return new_suspect

@router.post("/match")
async def match_suspects(case_summary: str = Body(..., embed=True)):
    """
    Finds the most similar existing suspects based on an input summary.
    """
    if not case_summary:
        raise HTTPException(status_code=400, detail="Summary text is required for matching.")
        
    results = await find_similar_suspects(case_summary)
    return {"query": case_summary, "matched_suspects": results}

@router.get("/", response_model=List[SuspectDoc])
async def get_all_suspects():
    """Retrieves all suspects from MongoDB."""
    suspects = list(suspects_col().find({}))
    for suspect in suspects:
        suspect['_id'] = str(suspect['_id'])
    return suspects