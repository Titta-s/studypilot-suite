from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from router import central_coordinator_router
from routes.payments import router as payments_router

app = FastAPI(
    title="StudyPilot API",
    version="6.0"
)

# Register the payment routes with the main application core
app.include_router(payments_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat")
async def chat_endpoint(
    message: str = Form(""),
    active_tab: str = Form("notes"),
    files: List[UploadFile] = File([])
):
    images_data = []

    for f in files:
        if f.filename:
            content = await f.read()
            images_data.append(
                {
                    "bytes": content,
                    "mime_type": f.content_type
                }
            )

    response = central_coordinator_router(
        user_query=message,
        images=images_data,
        active_tab=active_tab
    )

    return {
        "success": True,
        "response": response
    }