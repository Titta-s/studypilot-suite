import os
from google import genai
from dotenv import load_dotenv

# Load key variables from the local .env file
load_dotenv()

# Automatically initializes using GEMINI_API_KEY from environment memory
client = genai.Client()

# 🪐 Specialized Gemini Model Distribution Matrix
ROUTER_MODEL_ID = "gemini-3.5-flash"          # Frontier speed for intent classification
REASONING_MODEL_ID = "gemini-3.1-pro-preview" # State-of-the-art context processing & QA
STRUCTURED_MODEL_ID = "gemini-2.5-flash"      # Stable production workhorse for reliable JSON schemas
CREATOR_MODEL_ID = "gemini-3.1-flash-lite"    # Ultra-low latency for stories and vocabulary flashcards

# 🛠️ Fallback Link for older dependencies or router imports
MODEL_ID = STRUCTURED_MODEL_ID