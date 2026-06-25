from google.genai import types
import pydantic
from typing import List
from config import client, REASONING_MODEL_ID, STRUCTURED_MODEL_ID, CREATOR_MODEL_ID

# 🎯 Structured Pydantic Schemas for Interactive Frontend Engines
class QuizQuestion(pydantic.BaseModel):
    question: str
    options: List[str]
    correct_answer_index: int  
    explanation: str

class QuizPayload(pydantic.BaseModel):
    quiz_title: str
    questions: List[QuizQuestion]

# 🌟 Structured Schema for Flashcards
class FlashcardItem(pydantic.BaseModel):
    front_side: str  # The question or clue phrase (with an emoji!)
    back_side: str   # The simplified kid-friendly answer

class FlashcardPayload(pydantic.BaseModel):
    deck_title: str
    cards: List[FlashcardItem]


def prepare_multimodal_contents(user_query: str, image_bytes: bytes, mime_type: str):
    """Packs raw text prompts and visual image graphics together cleanly for the SDK."""
    contents = []
    if image_bytes and mime_type:
        contents.append(
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type,
            )
        )
    contents.append(user_query)
    return contents


def notes_agent(user_query: str, image_bytes: bytes = None, mime_type: str = None) -> str:
    """[The Research Assistant] Compiles structured summaries and key terms via Reasoning Model."""
    print(f"📸 [Vision Agent] -> Activating Smart Hybrid Notes Agent via {REASONING_MODEL_ID}...")
    instruction = """
    You are a friendly space-tiger study assistant. Summarize the user text or image provided.
    Format strictly using these headers:
    # 🗺️ THE HIGH-LEVEL MAP
    [Simple topic summary here]
    # 🔑 SUPER-IMPORTANT SECRET WORDS
    [Bullet points with bold definitions and emojis]
    """
    contents = prepare_multimodal_contents(user_query, image_bytes, mime_type)
    response = client.models.generate_content(
        model=REASONING_MODEL_ID, contents=contents, config=types.GenerateContentConfig(system_instruction=instruction)
    )
    return response.text


def qa_agent(user_query: str, image_bytes: bytes = None, mime_type: str = None) -> str:
    """[The Subject Matter Expert] Strictly answers questions using visible evidence via Reasoning Model."""
    print(f"📸 [Vision Agent] -> Activating Contextual Academic Q&A Agent via {REASONING_MODEL_ID}...")
    instruction = """
    You are a smart space-tiger tutor. Answer strictly using facts visible inside the provided image.
    If unrelated or not visible, say exactly:
    "🛸 Hmmm, my space scanners can't find that answer inside your uploaded image! Can you show me another angle?"
    """
    contents = prepare_multimodal_contents(user_query, image_bytes, mime_type)
    response = client.models.generate_content(
        model=REASONING_MODEL_ID, contents=contents, config=types.GenerateContentConfig(system_instruction=instruction)
    )
    return response.text


def quiz_agent(user_query: str, image_bytes: bytes = None, mime_type: str = None) -> str:
    """[The Examiner] Generates structured step-by-step interactive JSON quizzes via Structured Model."""
    print(f"📸 [Vision Agent] -> Activating Structured Quiz Engine via {STRUCTURED_MODEL_ID}...")
    
    # Updated instruction to prevent option bias
    instruction = """
    You are a friendly space-tiger quiz host. Generate exactly 3 multiple-choice questions for kids based on the content.
    Provide a clear, brief explanation for the correct answer.
    
    CRITICAL DISTRIBUTING RULE: 
    Do NOT place the correct answer at the same index for every question. 
    Mix it up completely! Ensure the correct_answer_index is randomized across 0, 1, and 2 
    (Options A, B, and C) so that the quiz remains challenging and unpredictable.
    """
    contents = prepare_multimodal_contents(user_query, image_bytes, mime_type)
    response = client.models.generate_content(
        model=STRUCTURED_MODEL_ID, contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=instruction,
            response_mime_type="application/json",
            response_schema=QuizPayload
        )
    )
    return response.text


def explainer_agent(user_query: str, image_bytes: bytes = None, mime_type: str = None) -> str:
    """[The Simple Explainer] Breaks down complex text/images into varied, kid-friendly explanations via Creator Model."""
    print(f"📸 [Vision Agent] -> Activating Kid-Friendly Simple Explainer Agent via {CREATOR_MODEL_ID}...")
    
    # 🌟 MODIFIED TO ALLOW DIRECT EXPLANATIONS WHEN APPROPRIATE
    instruction = """
    You are the Kid-Friendly Simple Explainer Agent, a warm and encouraging space-tiger mentor. 
    Look closely at the attached image or text prompt.
    Your mission is to explain what is happening using incredibly simple words and zero confusing academic jargon. 
    Imagine you are explaining it to an eager 7-year-old child!
    
    CRITICAL STRUCTURAL FLEXIBILITY RULE:
    Evaluate the topic carefully before writing. Decide whether a real-world analogy helps or overcomplicates the concept:
    1. If the concept can be explained more clearly by speaking directly, break it down simply without forcing an analogy.
    2. If a real-world analogy genuinely makes a tricky topic easier to understand, use a context-appropriate theme:
       - For data networks/systems: Use amusement parks, highway traffic, or delivery fleets.
       - For science/biology/nature: Use superhero teams, baking a complex cake, or magical kingdoms.
       - For history/organizations: Use a student council, a giant group project, or an international space station crew.
    
    Structure your output response strictly using these exact headers:
    # 🧸 THE BIG PICTURE STORY
    [Provide a clear, highly simplified breakdown of the core concept. Use a dynamic analogy ONLY if it adds clarity; otherwise, provide a direct explanation in kid-friendly terms.]
    # 🍕 BREAKING IT DOWN IN BITE-SIZED CHUNKS
    [Provide 3-4 bullet points explaining the key components using simple, descriptive language. If you used an analogy in the main story, keep the theme going here; if you didn't, provide clear and direct breakdowns.]
    # 💡 WHY IT MATTERS TO YOU!
    [Explain why learning this topic is useful, relevant, or just plain cool for a kid in daily life.]
    """
    
    contents = prepare_multimodal_contents(user_query, image_bytes, mime_type)
    response = client.models.generate_content(
        model=CREATOR_MODEL_ID, contents=contents,
        config=types.GenerateContentConfig(system_instruction=instruction)
    )
    return response.text


def flashcard_agent(user_query: str, image_bytes: bytes = None, mime_type: str = None) -> str:
    """[The Flashcard Hero] Extracts study terminology into structured active-recall cards via Creator Model."""
    print(f"📸 [Vision Agent] -> Activating JSON Flashcard Generation Engine via {CREATOR_MODEL_ID}...")
    
    instruction = """
    You are a friendly space-tiger study card creator. Read the attached textbook page or study concept.
    Extract exactly 4-5 core keywords, definitions, or essential historical fast-facts.
    
    Package them into simplified front-and-back flashcard objects built perfectly for kids:
    - front_side: A clean question or clue prompt phrase accompanied by an awesome matching emoji.
    - back_side: A short, simple, 1-sentence answering explanation revealing what that term means.
    """
    contents = prepare_multimodal_contents(user_query, image_bytes, mime_type)
    response = client.models.generate_content(
        model=CREATOR_MODEL_ID, contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=instruction,
            response_mime_type="application/json",
            response_schema=FlashcardPayload
        )
    )
    return response.text