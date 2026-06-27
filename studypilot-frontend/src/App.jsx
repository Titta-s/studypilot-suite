import React, { useState } from 'react';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Chatbot from './components/Chatbot';

export default function App() {
  // Application Screen Routing: 'login', 'signup', or 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return alert('🚀 Captain, missing launch credentials!');
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
    setUsername('');
    setPassword('');
  };

  // Switch workspace layout viewframes dynamically based on active status routing criteria
  switch (currentScreen) {
    case 'signup':
      return (
        <SignUp 
          onNavigateToLogin={() => setCurrentScreen('login')} 
        />
      );
      
    case 'dashboard':
      return (
        <Chatbot 
          username={username} 
          onLogout={handleLogout} 
        />
      );
      
    case 'login':
    default:
      return (
        <Login 
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          onLogin={handleLoginSubmit}
          onNavigateToSignUp={() => setCurrentScreen('signup')}
        />
      );
  }
}