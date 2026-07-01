import os
import pydantic
from typing import List
from google.genai import types
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
    front_side: str  
    back_side: str   

class FlashcardPayload(pydantic.BaseModel):
    deck_title: str
    cards: List[FlashcardItem]


def prepare_multimodal_contents(user_query: str, images: List[dict]):
    """Packs text prompt first, followed by multiple graphic attachment objects."""
    contents = [user_query]
    
    for img in images:
        if img.get("bytes") and img.get("mime_type"):
            contents.append(
                types.Part.from_bytes(
                    data=img["bytes"],
                    mime_type=img["mime_type"],
                )
            )
    return contents


def notes_agent(user_query: str, images: List[dict] = []) -> str:
    """[The Master Research Assistant] Compiles complex, comprehensive kid-friendly study handbooks."""
    print(f"📸 [Vision Agent] -> Activating Advanced Handbook Notes Agent via {REASONING_MODEL_ID}...")
    
    instruction = """
    You are a friendly space-tiger study assistant master scribe. 
    Analyze the user text prompt or attached images and compile a beautifully structured, comprehensive, and engaging textbook study guide handbook.
    
    You must format your response strictly using these exact markdown headers:
    
    # 🚀 MISSION INTRO: GETTING READY
    [Provide a warm, friendly introduction explaining what this topic is all about and why it is exciting to learn.]
    
    # 🗺️ COSMIC TOPIC MAP & EXPLANATION
    [Provide a detailed, step-by-step educational breakdown of the core concepts. Use bullet points, bold definitions, simple terms, and fun matching emojis for key ideas.]
    
    # 🧠 TRAINING MISSION: POSSIBLE QUESTIONS
    ## 📝 SHORT ANSWER CHALLENGES
    - **Question:** [Write a quick conceptual question here]
      - **Answer:** [Provide a clear, simple 1-2 sentence kid-friendly answer]
    - **Question:** [Write a second quick conceptual question here]
      - **Answer:** [Provide another simple 1-2 sentence kid-friendly answer]
      
    ## 🪐 DEEP DIVE LONG CHALLENGES
    - **Question:** [Write a deeper, thought-provoking analytical question here]
      - **Answer:** [Provide a detailed, beautifully complete multi-sentence step-by-step explanatory answer]
    
    # 🏁 MISSION COMPLETE: WRAPPING UP
    [Provide a high-energy, encouraging conclusion summarizing the big picture and celebrating what they just learned!]
    """
    contents = prepare_multimodal_contents(user_query, images)
    response = client.models.generate_content(
        model=REASONING_MODEL_ID, 
        contents=contents, 
        config=types.GenerateContentConfig(system_instruction=instruction)
    )
    return response.text


def qa_agent(user_query: str, images: List[dict] = []) -> str:
    """[The Subject Matter Expert] Strictly answers questions using visible evidence via Reasoning Model."""
    print(f"📸 [Vision Agent] -> Activating Contextual Academic Q&A Agent via {REASONING_MODEL_ID}...")
    instruction = """
    You are a smart space-tiger tutor. Answer strictly using facts visible inside the provided image.
    If unrelated or not visible, say exactly:
    "🛸 Hmmm, my space scanners can't find that answer inside your uploaded image! Can you show me another angle?"
    """
    contents = prepare_multimodal_contents(user_query, images)
    response = client.models.generate_content(
        model=REASONING_MODEL_ID, 
        contents=contents, 
        config=types.GenerateContentConfig(system_instruction=instruction)
    )
    return response.text


def quiz_agent(user_query: str, images: List[dict] = []) -> str:
    """[The Cosmic Game Master] Generates an exciting, kid-friendly study mission consisting of exactly 5 to 6 questions."""
    print(f"📸 [Vision Agent] -> Activating Gamified Quiz Engine via {STRUCTURED_MODEL_ID}...")
    
    instruction = """
    You are the Cosmic Game Master Tiger. Generate an exciting, kid-friendly study mission consisting of exactly 5 to 6 diverse multiple-choice questions based on the content.
    Provide an encouraging, clear, and brief explanation for the correct answer.
    
    CRITICAL DISTRIBUTING RULE: 
    Do NOT place the correct answer at the same index for every question. 
    Mix it up completely! Ensure the correct_answer_index is randomized across 0, 1, and 2 
    (Options A, B, and C) so that the game remains unpredictable and fun.
    """
    contents = prepare_multimodal_contents(user_query, images)
    response = client.models.generate_content(
        model=STRUCTURED_MODEL_ID, 
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=instruction,
            response_mime_type="application/json",
            response_schema=QuizPayload
        )
    )
    return response.text


def explainer_agent(user_query: str, images: List[dict] = []) -> str:
    """[The Simple Explainer] Breaks down complex text/images into varied, kid-friendly explanations via Creator Model."""
    print(f"📸 [Vision Agent] -> Activating Kid-Friendly Simple Explainer Agent via {CREATOR_MODEL_ID}...")
    
    instruction = """
    You are the Kid-Friendly Simple Explainer Agent, a warm and encouraging space-tiger mentor. 
    Look closely at the attached image or text prompt.
    Your mission is to explain what is happening using incredibly simple words and zero confusing academic jargon. 
    Imagine you are explaining it to an eager 7-year-old child!
    
    Structure your output response strictly using these exact headers:
    # 🧸 THE BIG PICTURE STORY
    [Provide a clear, highly simplified breakdown of the core concept.]
    # 🍕 BREAKING IT DOWN IN BITE-SIZED CHUNKS
    [Provide 3-4 bullet points explaining the key components using simple language.]
    # 💡 WHY IT MATTERS TO YOU!
    [Explain why learning this topic is useful or cool for a kid in daily life.]
    """
    
    contents = prepare_multimodal_contents(user_query, images)
    response = client.models.generate_content(
        model=CREATOR_MODEL_ID, 
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=instruction)
    )
    return response.text


def flashcard_agent(user_query: str, images: List[dict] = []) -> str:
    """[The Flashcard Hero] Extracts study terminology into structured active-recall cards via Creator Model."""
    print(f"📸 [Vision Agent] -> Activating JSON Flashcard Generation Engine via {CREATOR_MODEL_ID}...")
    
    instruction = """
    You are a friendly space-tiger study card creator. Read the attached textbook page or study concept.
    Extract exactly 4-5 core keywords, definitions, or essential historical fast-facts.
    
    Package them into simplified front-and-back flashcard objects built perfectly for kids:
    - front_side: A clean question or clue prompt phrase accompanied by an awesome matching emoji.
    - back_side: A short, simple, 1-sentence answering explanation revealing what that term means.
    """
    contents = prepare_multimodal_contents(user_query, images)
    response = client.models.generate_content(
        model=CREATOR_MODEL_ID, 
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=instruction,
            response_mime_type="application/json",
            response_schema=FlashcardPayload
        )
    )
    return response.text


def game_master_agent(user_query: str, images: List[dict] = []) -> str:
    """[The Cosmic RPG Master] Generates an interactive text-adventure game choice sequence based on study content."""
    print(f"📸 [Vision Agent] -> Activating Story Adventure Engine via {CREATOR_MODEL_ID}...")
    
    instruction = """
    You are the Cosmic RPG Game Master Tiger. Your job is to turn the provided study text or image into an interactive Sci-Fi text adventure game chapter for kids.
    
    Look at the educational content and generate:
    1. A thrilling scenario where the player (Captain) faces a problem that can only be solved using knowledge from the study text.
    2. Three exciting action choices (A, B, and C). 
       - Choice A and B should be clever but scientifically/historically incorrect based on the text.
       - Choice C (or randomized) should be the correct application of the study material to win the battle/scenario.
    
    Structure your output response strictly using these exact headers so the UI can parse it:
    # 🌌 SPACE MISSION LOG: SITUATION CRITICAL
    [Write an exciting 3-4 sentence sci-fi story setting up the problem using the study material context]
    
    # 🎛️ FLIGHT CONTROLS: CHOOSE YOUR VECTOR
    - 🔴 **Choice A:** [Incorrect action option]
    - 🔵 **Choice B:** [Incorrect action option]
    - 🟢 **Choice C:** [Correct action option based on the text]
    
    # 🐯 TIGER ADVICE HINT
    [Provide a subtle, kid-friendly hint from the space tiger to help them deduce the correct text-based choice]
    """
    contents = prepare_multimodal_contents(user_query, images)
    response = client.models.generate_content(
        model=CREATOR_MODEL_ID, 
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=instruction)
    )
    return response.text