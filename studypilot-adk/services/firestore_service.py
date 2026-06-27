from firebase.firebase_config import db
from datetime import datetime
from google.cloud.firestore_v1 import SERVER_TIMESTAMP



class FirestoreService:

    @staticmethod
    def save_agent_response(uid, agent, query, response, image_uploaded=False):

        # Map active_tab → Firestore collection
        collection_map = {
            "notes": "notes",
            "explainer": "explanations",
            "flashcards": "flashcards",
            "quiz": "quizzes",
        }

        collection = collection_map.get(agent, "agent_history")

        document = {
            "uid": uid,
            "agent": agent,
            "query": query,
            "response": response,
            "image_uploaded": image_uploaded,
            "created_at": SERVER_TIMESTAMP,
        }

        # Save to the specific collection
        db.collection(collection).add(document)

        # Also save to history 
        db.collection("agent_history").add(document)