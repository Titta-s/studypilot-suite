import React, { useState } from 'react';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Chatbot from './components/Chatbot';
import SubscriptionModal from './components/SubscriptionModal';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeDashboardView, setActiveDashboardView] = useState('chat');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return alert("🚀 Captain, missing launch credentials!");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("firebaseToken", token); // 🌟 Saves fresh token
      setCurrentScreen("subscription"); 
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("firebaseToken"); // 🌟 Clears stale token to prevent 401 errors
    setCurrentScreen("login");
    setUsername("");
    setPassword("");
    setActiveDashboardView('chat'); 
  };

  switch (currentScreen) {
    case 'signup':
      return <SignUp onNavigateToLogin={() => setCurrentScreen('login')} />;
    case 'subscription':
      return <SubscriptionModal onPaymentSuccess={() => setCurrentScreen('dashboard')} />;
    case 'dashboard':
      return (
        <Chatbot 
          username={username || "Explorer"} 
          onLogout={handleLogout}
          activeDashboardView={activeDashboardView}
          onViewChange={setActiveDashboardView}
        />
      );
    case 'login':
    default:
      return (
        <Login 
          username={username} setUsername={setUsername}
          password={password} setPassword={setPassword}
          onLogin={handleLoginSubmit}
          onNavigateToSignUp={() => setCurrentScreen('signup')}
        />
      );
  }
}