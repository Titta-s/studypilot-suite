import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAxBCCVnxNrOTuBdX39WfW_9wbY1pJo3KE",
  authDomain: "studypilot-bc07d.firebaseapp.com",
  projectId: "studypilot-bc07d",
  storageBucket: "studypilot-bc07d.firebasestorage.app",
  messagingSenderId: "1018391492753",
  appId: "1:1018391492753:web:0edd4b7e6fe174aab42730"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
