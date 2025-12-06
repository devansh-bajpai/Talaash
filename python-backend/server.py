from fastapi import FastAPI
from contextlib import asynccontextmanager
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
from extractCaseDetails import extract_case_details
from tools import dictToString
from indexController import searchIndex


class Case(BaseModel):
    description: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 App starting...")
    app.state.model = SentenceTransformer("all-MiniLM-L6-v2")

    yield
    
    del app.state.model
    print("⏬ App shutting down...")


app = FastAPI(lifespan=lifespan)

@app.post('/similar')
def getSimilarCases(case: Case):
    case_description = case.description
    case_dict = extract_case_details(case_description)

    if(case_dict == None):
        return None
    
    case_string = dictToString(case_dict)

    model = app.state.model
    embedding = model.encode([case_string])

    idx, distances = searchIndex(embedding)    

    return {
        "indices": idx.flatten().tolist(),
        "distances": distances.flatten().tolist()
    }
