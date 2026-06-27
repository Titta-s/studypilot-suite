from config import client, MODEL_ID
from agents import notes_agent, qa_agent, quiz_agent, explainer_agent, flashcard_agent

def central_coordinator_router(user_query: str, image_bytes: bytes = None, mime_type: str = None, active_tab: str = "notes") -> str:
    """
    [Central Coordinator Router Agent]
    Intelligently routes requests by evaluating structural intent keywords first,
    falling back to the active user's navigation tab context safely.
    """
    print(f"\n⚡ [Central Coordinator] Processing Query: '{user_query}' | Tab Context: {active_tab}")
    
    query_lower = user_query.lower()
    
    # 🧠 1. QUIZ ENGAGEMENT ENGINE
    if any(k in query_lower for k in ["quiz", "test", "question me", "ask me", "mcq", "exam", "quiz me"]):
        return quiz_agent(user_query, image_bytes, mime_type)
        
    # 🎴 2. FLASHCARD HERO ACTIVE RECALL ENGINE
    elif any(k in query_lower for k in ["flashcard", "card", "cards", "flip", "memory card"]):
        return flashcard_agent(user_query, image_bytes, mime_type)
        
    # 👶 3. COMPREHENSION & EXPLAINER ENGINE
    elif any(k in query_lower for k in ["explain", "understand", "what is", "why", "how", "teach", "don't get it", "confused", "help"]):
        return explainer_agent(user_query, image_bytes, mime_type)
        
    # 📝 4. ACADEMIC COMPILATION NOTES ENGINE
    elif any(k in query_lower for k in ["summarize", "make note", "make notes", "bullet", "points", "summary", "notes"]):
        return notes_agent(user_query, image_bytes, mime_type)
        
    # 🛰️ 5. CONTEXT STABILITY BACKUP LAYER
    if active_tab == "quiz":
        return quiz_agent(user_query, image_bytes, mime_type)
    elif active_tab == "flashcard":
        return flashcard_agent(user_query, image_bytes, mime_type)
    elif active_tab == "explainer":
        return explainer_agent(user_query, image_bytes, mime_type)
    elif active_tab == "qa":
        return qa_agent(user_query, image_bytes, mime_type)
    else:
        return notes_agent(user_query, image_bytes, mime_type)