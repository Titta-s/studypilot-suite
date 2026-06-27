from fastapi import APIRouter
from pydantic import BaseModel

from services.firestore_service import FirestoreService

router = APIRouter(prefix="/notes", tags=["Notes"])


class NoteRequest(BaseModel):
    user_id: str
    session_id: str
    title: str
    content: str


@router.post("/save")
def save_note(note: NoteRequest):
    result = FirestoreService.create_document(
        "notes",
        {
            "user_id": note.user_id,
            "session_id": note.session_id,
            "title": note.title,
            "content": note.content,
        },
    )

    return {
        "success": True,
        "message": "Note saved successfully",
        "document": result,
    }


@router.get("/all")
def get_notes():
    notes = FirestoreService.get_all_documents("notes")
    return notes