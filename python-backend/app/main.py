from fastapi import FastAPI
import uvicorn
import os
from app.controllers.case_controller import router as case_router
from app.controllers.suspect_controller import router as suspect_router
from app.services.stringEncoder import load_model 
from app.db.db import connect_mongo
from app.config import FAISS_CASE_INDEX_PATH, FAISS_SUSPECT_INDEX_PATH

app = FastAPI(title="Case Matcher API")

# routers
app.include_router(case_router, prefix="/cases", tags=["cases"])
app.include_router(suspect_router, prefix="/suspects", tags=["suspects"])

@app.on_event("startup")
async def startup_event():
    # 1. Connect to MongoDB
    connect_mongo()
    
    # 2. Load the heavy embedding model into global state
    load_model()
    
    # 3. Ensure the FAISS index directory exists
    faiss_dir = os.path.dirname(FAISS_CASE_INDEX_PATH)
    os.makedirs(faiss_dir, exist_ok=True)
    # Also check the suspect index path if it's different
    faiss_dir_suspect = os.path.dirname(FAISS_SUSPECT_INDEX_PATH)
    os.makedirs(faiss_dir_suspect, exist_ok=True)
    
@app.get("/")
def root():
    return {"status": "ok", "service": "case-matcher"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)