from pydantic import BaseModel, Field
from typing import List, Optional, Any

class CaseDoc(BaseModel):
    # Using Optional[str] and Field(default=None) to handle auto-generated Mongo IDs 
    _id: Optional[str] = Field(None, alias='_id')
    case_text: str
    crime_type: Optional[str] = None
    location: Optional[str] = None
    date: Optional[str] = None
    items_stolen: Optional[List[str]] = None
    suspects: Optional[List[str]] = None
    ground_truth_suspect: Optional[str] = None
    embedding: Optional[List[float]] = None

class SuspectDoc(BaseModel):
    _id: Optional[str] = Field(None, alias='_id')
    name: Optional[str]
    profile_text: str
    labels: Optional[List[str]] = None
    past_case_ids: Optional[List[str]] = None
    embedding: Optional[List[float]] = None