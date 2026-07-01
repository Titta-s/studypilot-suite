import os
import requests
import json
import time
import pydantic
from typing import List, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load workspace orchestration properties
load_dotenv()

# Initialize the automated QA evaluator client
client = genai.Client()
JUDGE_MODEL = "gemini-2.5-flash"
BACKEND_URL = "http://localhost:8000/api/chat"

# 🎯 Structured Pydantic Schema for the AI QA Judge Evaluation Logs
class TestEvaluationResult(pydantic.BaseModel):
    test_case_name: str
    passed: bool
    detected_routing_mode: str
    structural_format_valid: bool
    critique_and_reasoning: str

class AutomationReport(pydantic.BaseModel):
    suite_title: str
    total_executed: int
    total_passed: int
    evaluations: List[TestEvaluationResult]


### 🛠️ Step 1: Automated Test Case Factory Generator
def generate_synthetic_test_cases() -> str:
    """Uses Generative AI to dream up rigorous, creative edge-case student personas to stress-test routing hooks."""
    print("🛸 [QA Engine] -> Generating dynamic adversarial edge-case prompts using Generative AI...")
    
    prompt = """
    You are a Senior QA Automation Engineer building test vectors for an educational platform.
    Generate a JSON structured list containing 3 tricky test cases to evaluate a router matrix.
    
    The router looks for these keywords:
    - 'quiz', 'test', 'question me' -> ROUTES TO QUIZ (Returns JSON string matching QuizPayload)
    - 'flashcard', 'card', 'flip' -> ROUTES TO FLASHCARD (Returns JSON string matching FlashcardPayload)
    - 'explain', 'understand', 'teach' -> ROUTES TO EXPLAINER (Returns Plaintext with Markdown Headers # 🧸 THE BIG PICTURE STORY)
    - 'summarize', 'make notes' -> ROUTES TO NOTES (Returns Plaintext with Markdown Headers # 🗺️ THE HIGH-LEVEL MAP)
    
    Provide a list containing exactly 3 distinct test items. Each item must have:
    - 'name': Descriptive case ID.
    - 'prompt': A tricky user input that mixes terms or uses non-standard phrasing.
    - 'target_tab': The primary navigation screen state to pass ('notes', 'quiz', 'flashcard', 'explainer').
    
    Return ONLY a raw valid JSON string array matching this structure:
    [{"name": "string", "prompt": "string", "target_tab": "string"}]
    """
    
    response = client.models.generate_content(
        model=JUDGE_MODEL,
        contents=prompt
    )
    return response.text.strip()


### 🛰️ Step 2: AI Evaluator Judge Engine (with 503 Resiliency Retry Matrix)
def evaluate_response_with_ai_judge(test_name: str, prompt: str, target_tab: str, raw_response: str) -> TestEvaluationResult:
    """Uses GenAI as a specialized Judge with an automated retry fallback for temporary 503 capacity spikes."""
    
    judge_instruction = f"""
    You are an automated AI Judge validating micro-agent backend responses for accuracy, quality, and structural format stability.
    
    [Context Configuration Under Assessment]
    Test Case Name: "{test_name}"
    Original Input Query Sent: "{prompt}"
    Expected Tab Destination Context: "{target_tab}"
    
    [Raw Telemetry Content Arriving from Server]
    {raw_response}
    
    Evaluate carefully:
    1. Check if the response is valid JSON when it should be (Quizzes and Flashcards require JSON payloads).
    2. Check if the response contains the requested system header markers (# 🧸 THE BIG PICTURE STORY or # 🗺️ THE HIGH-LEVEL MAP) when plain text explanations are requested.
    3. Ensure there are no raw server trace errors or generic fault strings inside.
    
    Populate your response strictly mapping to the provided validation schema format criteria.
    """

    # Retry loop configuration matrix to handle global infrastructure overloads
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=JUDGE_MODEL,
                contents=judge_instruction,  # Fixed: Restored the required keyword argument tracking context
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=TestEvaluationResult
                )
            )
            return TestEvaluationResult.model_validate_json(response.text)
        except Exception as e:
            if "503" in str(e) or "UNAVAILABLE" in str(e).upper():
                wait_time = (attempt + 1) * 3
                print(f"⚠️ [API Overload] Google servers are busy (503). Backing off and retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise e

    return TestEvaluationResult(
        test_case_name=test_name,
        passed=False,
        detected_routing_mode=target_tab.upper(),
        structural_format_valid=False,
        critique_and_reasoning="❌ Verification aborted: Google GenAI API remained overloaded with 503 errors across all retry attempts."
    )


### 🕹️ Step 3: Core Automation Execution Matrix with Security Context Headers
def execute_automated_suite(sample_image_path: Optional[str] = None):
    """Orchestrates full suite generation, mock network form integration dispatching, and report aggregation."""
    print("\n⚡ Starting 100% Automated StudyPilot Multi-Agent Verification Lifecycle...")
    
    raw_specs = generate_synthetic_test_cases()
    if "```json" in raw_specs:
        raw_specs = raw_specs.split("```json")[1].split("```")[0].strip()
        
    test_cases = json.loads(raw_specs)
    
    evaluation_log: List[TestEvaluationResult] = []
    passed_count = 0
    
    # Secure token payload matching your backend's authorization validation layout
    headers = {
        "Authorization": "Bearer LOCAL_TEST_AUTOMATION_SECRET"
    }
    
    for case in test_cases:
        print(f"\n🏃 Running Test Vector [{case['name']}] -> Prompt: '{case['prompt']}'")
        
        form_data = {
            "message": case["prompt"],
            "active_tab": case["target_tab"]
        }
        
        files = {}
        if sample_image_path and os.path.exists(sample_image_path):
            files["file"] = (os.path.basename(sample_image_path), open(sample_image_path, "rb"), "image/png")
            
        try:
            response = requests.post(BACKEND_URL, data=form_data, files=files if files else None, headers=headers)
            
            if response.status_code == 200:
                server_payload = response.json()
                raw_ai_text = server_payload.get("response", "")
            else:
                raw_ai_text = f"CRITICAL SYSTEM ERROR: Network status port code returned {response.status_code} - {response.text}"
        except Exception as e:
            raw_ai_text = f"CONNECTION FAULT DETECTED: {str(e)}"
            
        judge_verdict = evaluate_response_with_ai_judge(
            test_name=case["name"],
            prompt=case["prompt"],
            target_tab=case["target_tab"],
            raw_response=raw_ai_text
        )
        
        print(f"🎯 Verdict: {'✅ PASSED' if judge_verdict.passed else '❌ FAILED'} | Detected Mode: {judge_verdict.detected_routing_mode}")
        print(f"📖 Reason: {judge_verdict.critique_and_reasoning}")
        
        if judge_verdict.passed:
            passed_count += 1
        evaluation_log.append(judge_verdict)
        
    generate_markdown_report(passed_count, len(test_cases), evaluation_log)


def generate_markdown_report(passed: int, total: int, results: List[TestEvaluationResult]):
    """Compiles results into a clean, human-readable markdown file."""
    report_path = "AUTOMATED_QA_REPORT.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# 🪐 StudyPilot Automated QA Verification Logs\n\n")
        f.write(f"### 📊 Execution Statistics Dashboard\n")
        f.write(f"- **Total System Tests Simulated:** {total}\n")
        f.write(f"- **System Pass-Rate Factor:** {passed} / {total} Checks Stable\n")
        f.write(f"- **Status Metric:** {'🟢 SYSTEM OPERATIONAL' if passed == total else '🔴 DISCREPANCIES DETECTED'}\n\n")
        
        f.write("--- \n\n### 🧬 Individual Node Telemetry Breakdowns\n")
        for res in results:
            status_emoji = "✅ PASS" if res.passed else "❌ FAIL"
            f.write(f"#### {res.test_case_name} | Status: `{status_emoji}`\n")
            f.write(f"* **Router Classified Vector Target:** `{res.detected_routing_mode}`\n")
            f.write(f"* **Schema Compliance Match Verified:** `{res.structural_format_valid}`\n")
            f.write(f"* **AI Judge Critique Analysis Log:** *\"{res.critique_and_reasoning}\"*\n\n")
            
    print(f"\n✨ Verification suite run complete! Full report metrics written to: {os.path.abspath(report_path)}")


if __name__ == "__main__":
    # Ensure your uvicorn server app.py is actively running on port 8000 before execution!
    execute_automated_suite(sample_image_path="p1.png")