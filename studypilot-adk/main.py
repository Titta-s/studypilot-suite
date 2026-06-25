from config import client, ROUTER_MODEL_ID
from agents import notes_agent, qa_agent, quiz_agent

def central_coordinator_router(user_query: str, mock_database_context: str = "Cell biology basic structures notes.") -> str:
    """
    [Central Coordinator Agent - The Project Manager]
    Listens to the student, computes intent routing classification, 
    and hands execution over to the correct specialized target agent.
    """
    print(f"\n⚡ [Central Coordinator] Computing intent routing logic from user space telemetry via {ROUTER_MODEL_ID}...")
    
    classification_prompt = f"""
    You are a classification specialist routing engine for a student application.
    Analyze the user's query below and determine which specialized downstream agent is required.
    
    User Query: "{user_query}"
    
    Evaluate the intent string carefully:
    - If the user explicitly asks a direct question requiring an answer from their data or notes, choose "QA".
    - If the user asks for a quiz, mock exam, test, or practice questions, choose "QUIZ".
    - If the user asks for summaries, study guides, outlines, notes generation, or explanations, choose "NOTES".
    
    Respond with EXACTLY one word: either "NOTES", "QA", or "QUIZ". Do not include any other text or punctuation.
    """
    
    # Low-latency intent classification evaluation pass
    route_decision = client.models.generate_content(
        model=ROUTER_MODEL_ID,
        contents=classification_prompt
    ).text.strip().upper()
    
    print(f"🎯 [Central Coordinator] Intent Routing Classification -> Selected Path: {route_decision}")
    
    # Handoff multi-agent operational flow cleanly to selected target node
    if "QUIZ" in route_decision:
        return quiz_agent(user_query, image_bytes=None, mime_type=None)
    elif "QA" in route_decision:
        return qa_agent(user_query, image_bytes=None, mime_type=None)
    else:
        return notes_agent(user_query, image_bytes=None, mime_type=None)