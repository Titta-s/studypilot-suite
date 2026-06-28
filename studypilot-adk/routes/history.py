from fastapi import APIRouter, Depends
from firebase_admin import firestore

from firebase.firebase_auth import verify_firebase_token
from firebase.firebase_config import db

router = APIRouter(prefix="/history", tags=["History"])


@router.get("/{collection}")
def get_history(
    collection: str,
    user=Depends(verify_firebase_token)
):
    docs = (
        db.collection(collection)
        .where("uid", "==", user["uid"])
        .stream()
    )

    return [
        {
            "id": doc.id,
            **doc.to_dict()
        }
        for doc in docs
    ]