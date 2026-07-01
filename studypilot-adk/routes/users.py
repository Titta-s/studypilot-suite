from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
# Importing your existing firestore service setup
from services.firestore_service import db 

router = APIRouter(prefix="/api/user", tags=["User Profile"])

class BadgeSavePayload(BaseModel):
    username: str
    badges: Dict[str, int]

@router.get("/badges/{username}")
async def get_user_badges(username: str):
    """Retrieves saved badges from Firestore for the logged-in astronaut."""
    try:
        # Sanitize username to use as a document ID key safely
        doc_id = username.replace(".", "_")
        user_ref = db.collection("users").document(doc_id)
        doc = user_ref.get()
        
        if doc.exists:
          user_data = doc.to_dict()
          if "badges" in user_data:
              return {"success": True, "badges": user_data["badges"]}
              
        # Default initialization profile structure if it's a new sign-in
        return {
            "success": True, 
            "badges": {
                "cadet": 1, "striker": 0, "commander": 0, "perfect": 0,
                "explorer": 0, "notetaker": 0, "explainer": 0, "flashcard": 0, "warrior": 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database retrieval fault: {str(e)}")

@router.post("/badges/save")
async def save_user_badges(payload: BadgeSavePayload):
    """Saves or merges unlocked badge tracks securely to Firestore."""
    try:
        doc_id = payload.username.replace(".", "_")
        user_ref = db.collection("users").document(doc_id)
        
        # Merge ensures we update badges without wiping out other user fields
        user_ref.set({"badges": payload.badges}, merge=True)
        return {"success": True, "message": "Badges safely locked in planetary orbit! 🐯"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database write fault: {str(e)}")