import os
import asyncio
from dotenv import load_dotenv

# Pull in your environment configurations cleanly from your updated .env file
load_dotenv()

# Import our master router controller block function
from agents import (
    notes_agent,
    qa_agent,
    quiz_agent,
    explainer_agent,
    flashcard_agent)

async def main():
    print("\n🚀 Triggering a REAL production SDK Agent Team request using environmental keys...")
    print("-" * 60)
    
    try:
        # Test Case 1: Notes Generation Intent Routing
        test_query_1 = "Summarize the main differences between plant and animal cells."
        print(f"Sending Note Request: '{test_query_1}'")
        response_1 = notes_agent(test_query_1)
        
        print("\n✨ SUCCESS! Notes Response Received:")
        print("=" * 60)
        print(response_1)
        print("=" * 60)
        
    
        print("\n" + "#" * 40 + "\n")
        
        print("\n=== QA AGENT ===")
        print(qa_agent("What is TCP?"))

        print("\n=== EXPLAINER AGENT ===")
        print(explainer_agent("Explain TCP"))

        print("\n=== FLASHCARD AGENT ===")
        print(flashcard_agent("TCP"))

        # Test Case 2: Quiz Generation Intent Routing
        test_query_2 = "Give me a quick mock quiz on basic cell structures."
        print(f"Sending Quiz Request: '{test_query_2}'")
        response_2 = quiz_agent(test_query_2)
        
        print("\n✨ SUCCESS! Quiz Response Received:")
        print("=" * 60)
        print(response_2)
        print("=" * 60)
        
    except Exception as e:
        print("\n❌ Runtime Execution Error:")
        print(e)

if __name__ == "__main__":
    asyncio.run(main())