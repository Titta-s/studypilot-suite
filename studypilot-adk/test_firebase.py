from firebase.firebase_config import db

collections = db.collections()

print("Connected to Firebase!")

for collection in collections:
    print(collection.id)