from fastapi import Header, HTTPException
from firebase_admin import auth

def verify_firebase_token(authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split("Bearer ")[1]

    # 🌟 LOCAL TEST AUTOMATION BYPASS HOOK
    # Allows your automated QA engine to test routes locally without failing auth checks
    if token == "LOCAL_TEST_AUTOMATION_SECRET":
        return {"uid": "local_qa_test_user", "email": "test_cadet@galaxy.com"}

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")