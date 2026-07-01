from agents import notes_agent, qa_agent, quiz_agent, explainer_agent, flashcard_agent, game_master_agent

def central_coordinator_router(user_query: str, images: list, active_tab: str = "notes") -> str:
    """
    [Central Coordinator Router Agent]
    Intelligently routes multi-image student bundles by looking at search intent 
    keywords first, falling back onto core workspace view tabs dynamically.
    """
    print(f"\n⚡ [Central Coordinator] Processing Query: '{user_query}' | Tab Context: {active_tab} | Images: {len(images)}")
    
    query_lower = user_query.lower()
    
    # Intent Routing Matrix
    if any(k in query_lower for k in ["game", "story", "adventure", "rpg", "play story"]):
        return game_master_agent(user_query, images)
    elif any(k in query_lower for k in ["quiz", "test", "question me", "ask me", "mcq", "exam", "quiz me"]):
        return quiz_agent(user_query, images)
    elif any(k in query_lower for k in ["flashcard", "card", "cards", "flip", "memory card"]):
        return flashcard_agent(user_query, images)
    elif any(k in query_lower for k in ["explain", "understand", "teach", "don't get it", "confused"]):
        return explainer_agent(user_query, images)
    elif any(k in query_lower for k in ["what is", "why", "how"]):
        return qa_agent(user_query, images)
    elif any(k in query_lower for k in ["summarize", "make note", "make notes", "bullet", "points", "summary", "notes"]):
        return notes_agent(user_query, images)
        
    # Tab Fallback Layer Matrix
    if active_tab == "story":
        return game_master_agent(user_query, images)
    elif active_tab == "quiz":
        return quiz_agent(user_query, images)
    elif active_tab in ["flashcard", "flashcards"]:
        return flashcard_agent(user_query, images)
    elif active_tab == "explainer":
        return explainer_agent(user_query, images)
    elif active_tab == "qa":
        return qa_agent(user_query, images)
    else:
        return notes_agent(user_query, images)