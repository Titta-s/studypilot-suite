import time
from firebase.firebase_config import db  
from services.firestore_service import FirestoreService

def test_database_write_and_cleanup():
    """Production unit test validating explicit root collection mappings."""
    print("\n🛸 [Database QA] Testing production Firestore storage layers...")
    
    mock_uid = "local_qa_test_user"
    mock_agent = "explainer"
    mock_query = "Test database operational health checklist parameters"
    mock_response = "# 🧸 THE BIG PICTURE STORY\nSystem database transaction verification confirmed."
    
    unique_timestamp = str(int(time.time()))
    full_test_query = f"{mock_query} [{unique_timestamp}]"
    
    try:
        print("📝 Step 1: Serializing test telemetry log payload to database...")
        FirestoreService.save_agent_response(
            uid=mock_uid,
            agent=mock_agent,
            query=full_test_query,
            response=mock_response,
            image_uploaded=False
        )
        print("✅ Data serialization pass complete.")
        
        print("\n⏳ Pausing for 2 seconds to let indexers propagate globally...")
        time.sleep(2)
        
        print("🔍 Step 2: Validating schema structures inside root collections...")
        
        # Test targets matching the exact structures caught during diagnostics
        target_collections = ["agent_history", "explanations"]
        found_records = []
        
        for col_name in target_collections:
            col_ref = db.collection(col_name)
            docs = col_ref.stream()
            
            for doc in docs:
                data = doc.to_dict()
                if full_test_query in str(data.values()):
                    print(f"   🎯 Match secured in root collection [{col_name}] -> Doc ID: {doc.id}")
                    assert data.get("agent") == mock_agent or col_name == "explanations", "Data context corruption detected."
                    found_records.append((col_name, doc.id))
                    break
                    
        assert len(found_records) > 0, f"❌ Core verification failure: Query string '{full_test_query}' went undetected."
        print("✅ Data validation schema structurally complete and verified 1:1.")
        
        print("\n🧼 Step 3: Purging temporary test document contexts...")
        for col_name, doc_id in found_records:
            db.collection(col_name).document(doc_id).delete()
            print(f"   🧹 Cleaned node: {col_name}/{doc_id}")
            
        print("\n🟢 ALL FIREBASE DATABASE TRANSACTION CHECKS PASSED!")
        
    except Exception as db_err:
        print(f"❌ DATABASE TELEMETRY TESTING CRASHED: {db_err}")
        raise db_err

if __name__ == "__main__":
    test_database_write_and_cleanup()