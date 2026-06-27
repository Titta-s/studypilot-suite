from fastapi import APIRouter
from firebase.firebase_config import db

router = APIRouter(prefix="/history", tags=["History"])

@router.get("/{collection}")
def get_history(collection: str):
    docs = db.collection(collection).stream()

    return [
        {
            "id": doc.id,
            **doc.to_dict()
        }
        for doc in docs
    ]