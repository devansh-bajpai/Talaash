from pymongo import MongoClient
from app.config import MONGO_URI, DB_NAME
import logging

_client = None
_db = None

def connect_mongo():
    global _client, _db
    if _client is None:
        _client = MongoClient(MONGO_URI)
        _db = _client[DB_NAME]
        logging.info(f"Connected to MongoDB: {MONGO_URI}/{DB_NAME}")
    return _db

def get_db():
    if _db is None:
        return connect_mongo()
    return _db

def cases_col():
    return get_db()["cases"]

def suspects_col():
    return get_db()["suspects"]

def reset_collections():
    get_db()["cases"].delete_many({})
    get_db()["suspects"].delete_many({})