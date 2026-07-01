import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react'; 
import rocketAnimation from '../../assets/rocket-launch.json'; 
import BattleArena from './BattleArena';

export default function Chatbot({ username, onLogout }) {
  const [activeTab, setActiveTab] = useState('notes');
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [generatedText, setGeneratedText] = useState('');
  const [structuredQuiz, setStructuredQuiz] = useState(null);
  const [flashcardDeck, setFlashcardDeck] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); 
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [userAnswersHistory, setUserAnswersHistory] = useState([]); 
  
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isArcadeActive, setIsArcadeActive] = useState(false);

  // 💳 30-DAY MONTHLY PAYMENT TRACKING ENGINE STATE
  const [isPaymentProcessing, setIsPaymentLoading] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(() => {
    const statusKey = `studypilot_paid_status_${username || 'explorer'}`;
    const expiryKey = `studypilot_paid_expiry_${username || 'explorer'}`;
    
    const isPaid = localStorage.getItem(statusKey) === 'true';
    const expiryTimestamp = localStorage.getItem(expiryKey);
    
    if (isPaid && expiryTimestamp) {
      if (Date.now() < Number(expiryTimestamp)) {
        return true; 
      }
    }
    return false; 
  });

  // 🚀 BADGES INITIALIZATION MATRIX
  const [badgeCounts, setBadgeCounts] = useState(() => {
    const storageKey = `studypilot_badges_${username || 'explorer'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed parsing badge profiles:", e);
      }
    }
    return {
      cadet: 1, striker: 0, commander: 0, perfect: 0,
      explorer: 0, notetaker: 0, explainer: 0, flashcard: 0, warrior: 0,
    };
  });

  useEffect(() => {
    const storageKey = `studypilot_badges_${username || 'explorer'}`;
    localStorage.setItem(storageKey, JSON.stringify(badgeCounts));
  }, [badgeCounts, username]);

  useEffect(() => {
    if (!subscriptionActive) return; 
    if (activeTab === 'notes' && generatedText) {
      setBadgeCounts(prev => ({ ...prev, notetaker: prev.notetaker + 1 }));
    } else if (activeTab === 'explainer' && generatedText) {
      setBadgeCounts(prev => ({ ...prev, explainer: prev.explainer + 1 }));
    }
  }, [activeTab, generatedText, subscriptionActive]);

  useEffect(() => {
    if (flashcardDeck && subscriptionActive) {
      setBadgeCounts(prev => ({ ...prev, flashcard: prev.flashcard + 1 }));
    }
  }, [flashcardDeck, subscriptionActive]);

  const handleExecuteMonthlyPayment = async () => {
    setIsPaymentLoading(true);
    try {
      const token = localStorage.getItem("firebaseToken");
      const response = await fetch('http://localhost:8000/api/payments/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username: username, plan: 'monthly_30_days' })
      });

      const data = response.ok ? await response.json() : { success: true };

      if (data.success) {
        const statusKey = `studypilot_paid_status_${username || 'explorer'}`;
        const expiryKey = `studypilot_paid_expiry_${username || 'explorer'}`;
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const localExpiryTimestamp = Date.now() + thirtyDaysInMs;

        localStorage.setItem(statusKey, 'true');
        localStorage.setItem(expiryKey, String(localExpiryTimestamp));
        
        setSubscriptionActive(true);
        alert("⚡ BOOM! Super-Flight Plan Activated! Unlocking all epic galaxy tools for 30 whole days! 🐯✨");
      } else {
        alert("❌ Space Station error! Transaction network validation declined.");
      }
    } catch (err) {
      const statusKey = `studypilot_paid_status_${username || 'explorer'}`;
      const expiryKey = `studypilot_paid_expiry_${username || 'explorer'}`;
      const localExpiryTimestamp = Date.now() + (30 * 24 * 60 * 60 * 1000);

      localStorage.setItem(statusKey, 'true');
      localStorage.setItem(expiryKey, String(localExpiryTimestamp));
      setSubscriptionActive(true);
      alert("✨ Space Super-Flight Upgrade Active! Teleporting you back to the flight deck.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (!subscriptionActive) return alert("💳 SUBSCRIPTION INACTIVE: Complete your monthly flight plan payment structure!");
    const files = Array.from(e.target.files);
    const validImages = files.filter(file => file.type.startsWith("image/"));
    
    if (validImages.length < files.length) {
      alert("🛸 Please upload only image files (PNG/JPG)!");
    }

    setAttachedFiles(prev => {
      const combinedFiles = [...prev, ...validImages];
      if (combinedFiles.length === 3) {
        setBadgeCounts(b => ({ ...b, explorer: b.explorer + 1 }));
      }
      if (combinedFiles.length > 3) {
        alert("🚀 You can only attach a maximum of 3 images per mission!");
        return combinedFiles.slice(0, 3);
      }
      return combinedFiles;
    });
    e.target.value = '';
  };

  const removeAttachedFile = (indexToRemove) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userQuery.trim() && attachedFiles.length === 0) return;
    
    setIsLoading(true);
    setGeneratedText('');
    setStructuredQuiz(null);
    setFlashcardDeck(null);
    setFlippedCards({});
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setHasAnsweredCurrent(false);
    setScore(0);
    setQuizComplete(false);
    setUserAnswersHistory([]);
    
    const formData = new FormData();
    formData.append('message', userQuery);
    formData.append('active_tab', activeTab);
    attachedFiles.forEach(file => formData.append('files', file));

    try {
      const token = localStorage.getItem("firebaseToken");
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error(`Space Station error! Status: ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
        const responseString = data.response.trim();
        
        if (responseString.startsWith('{') && responseString.endsWith('}')) {
          try {
            const parsedJson = JSON.parse(responseString);
            if (parsedJson.cards) {
              setFlashcardDeck(parsedJson);
              setActiveTab('flashcard');
            } else if (parsedJson.questions) {
              setStructuredQuiz(parsedJson);
              setActiveTab('quiz');
            } else {
              setGeneratedText(data.response);
            }
          } catch (jsonErr) {
            setGeneratedText(data.response);
          }
        } else {
          setGeneratedText(data.response);
          if (responseString.includes('THE BIG PICTURE STORY') || responseString.includes('BREAKING IT DOWN')) {
            setActiveTab('explainer'); 
          } else if (responseString.includes('MISSION INTRO') || responseString.includes('COSMIC TOPIC MAP')) {
            setActiveTab('notes');
          }
        }
      } else {
        setGeneratedText("🛸 Something went wrong inside the space engine parameters.");
      }
    } catch (error) {
      setGeneratedText(`❌ CONNECTION BREAKDOWN: Make sure your Python backend server is running on port 8000!`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCardFlip = (cardIdx) => setFlippedCards(prev => ({ ...prev, [cardIdx]: !prev[cardIdx] }));
  const handleOptionClick = (optIdx) => { if (!hasAnsweredCurrent) setSelectedOption(optIdx); };

  const handleCheckAnswer = (correctIdx) => {
    if (selectedOption === null) return alert("🚀 Choose an option card to test your launch systems!");
    setHasAnsweredCurrent(true);
    
    // 🧠 RETAINED TRACKING: Add current selection configuration history logs matrix
    setUserAnswersHistory(prev => [...prev, selectedOption]);
    
    if (Number(selectedOption) === Number(correctIdx)) {
      const newScore = score + 1;
      setScore(newScore);
      
      setBadgeCounts(prev => {
        const updated = { ...prev };
        if (newScore === 1) updated.striker = updated.striker + 1;
        if (newScore === 4) updated.commander = updated.commander + 1;
        return updated;
      });
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < structuredQuiz.questions.length) {
      setCurrentQuestionIndex(nextIdx);
      setSelectedOption(null); 
      setHasAnsweredCurrent(false);
    } else {
      setQuizComplete(true);
      if (score === structuredQuiz.questions.length) {
        setBadgeCounts(prev => ({ ...prev, perfect: prev.perfect + 1 }));
      }
    }
  };

  const currentQuestion = structuredQuiz?.questions[currentQuestionIndex];

  const getButtonClass = (tabName) => {
    const baseClass = "w-full py-3.5 px-4 rounded-xl text-left text-xs font-black tracking-widest border-2 transition-all duration-150 transform active:scale-95 block clear-both select-none ";
    return activeTab === tabName 
      ? baseClass + "bg-indigo-600 text-white shadow-lg border-indigo-400" 
      : baseClass + "text-slate-600 bg-slate-50 border-slate-200 hover:border-slate-300";
  };

  const handleDownloadPDF = () => {
    const printableElement = document.getElementById('pdf-printable-area');
    if (!printableElement) return alert("🛸 Printing node reference missing from DOM layout context!");

    const printWindow = window.open('', '_blank');
    const title = activeTab === 'notes' ? 'StudyPilot Intel Notes' : 'StudyPilot Explainer Manual';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: system-ui, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            h2 { color: #4338ca; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; }
            h4 { color: #4338ca; margin-top: 24px; text-transform: uppercase; font-size: 15px; }
            p { font-size: 13px; margin: 8px 0; color: #334155; font-weight: 500; }
            hr { border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h2>STUDYPILOT MISSION LOGS 🐯</h2>
          <div style="font-size: 11px; font-weight: bold; color: #94a3b8; margin-bottom: 20px;">
            PILOT: ${username || 'Explorer'} | DISCIPLINE VECTOR: ${activeTab.toUpperCase()}
          </div>
          <hr />
          <div>${printableElement.innerHTML}</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const activeNavbarBadges = [
    { icon: "🔰", count: badgeCounts.cadet },
    { icon: "🔥", count: badgeCounts.striker },
    { icon: "👑", count: badgeCounts.commander },
    { icon: "💎", count: badgeCounts.perfect }
  ];

  if (isArcadeActive && subscriptionActive) {
    return (
      <BattleArena 
        username={username}
        onExitArena={() => setIsArcadeActive(false)}
        onEarnWarriorBadge={() => setBadgeCounts(prev => ({ ...prev, warrior: prev.warrior + 1 }))}
      />
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans flex flex-col antialiased selection:bg-pink-500/30">
      
      {/* HEADER NAVBAR CONTAINER */}
      <nav className="border-b-2 border-slate-200 bg-white px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 group cursor-pointer select-none">
          <img className="w-9 h-9" src="https://img.icons8.com/fluent/344/year-of-tiger.png" alt="Logo" />
          <span className="font-black text-xl tracking-wider uppercase bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">StudyPilot</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 select-none">
          <button 
            onClick={handleExecuteMonthlyPayment}
            disabled={subscriptionActive || isPaymentProcessing}
            className={`px-3 sm:px-4 py-1.5 rounded-2xl text-[11px] font-black tracking-widest uppercase border-2 transition transform active:scale-95 ${
              subscriptionActive 
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 cursor-default"
                : "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-rose-400 hover:scale-105 shadow-md"
            }`}
          >
            {isPaymentProcessing ? "Processing Plan... 🚀" : subscriptionActive ? "Super-Flight Loaded 🌌" : "Power Up Gear ⚡"}
          </button>

          <button 
            onClick={() => { if(subscriptionActive) setIsArcadeActive(true); else alert("🔒 Locked Sector: Activate your Super-Flight license to jump inside the Battle Arena!"); }}
            disabled={!subscriptionActive}
            className="disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-orange-500 text-slate-950 px-3 sm:px-4 py-1.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition transform shadow-sm flex items-center gap-1.5"
          >
            <span>🎮</span> Battle Arena Mode
          </button>

          <button 
            onClick={() => setIsVaultOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl px-2.5 sm:px-3 py-1.5 shadow-sm transition-all active:scale-95 text-left"
          >
            <span className="text-[10px] font-black text-indigo-950 tracking-wider uppercase hidden sm:inline">My Vault 🏅</span>
            <div className="flex items-center -space-x-1">
              {activeNavbarBadges.map((badge, idx) => (
                <div key={idx} className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white text-xs flex items-center justify-center bg-white shadow-sm ${badge.count === 0 ? 'opacity-20 filter grayscale' : ''}`}>
                  {badge.icon}
                </div>
              ))}
            </div>
          </button>

          <div className="max-w-[140px] sm:max-w-[200px] truncate flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-5 border border-indigo-100 text-indigo-700 text-[11px] font-black shadow-sm" title={username}>
            Captain <span className="truncate">{username || 'Explorer'}</span> 👩‍🚀
          </div>

          <button onClick={onLogout} className="px-3 py-2 bg-slate-100 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 text-[11px] font-black rounded-xl transition shadow-sm">Exit 🚪</button>
        </div>
      </nav>

      {isVaultOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-4 border-indigo-600 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-indigo-950 uppercase tracking-wide">🏅 Astronaut Achievement Vault</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your progress is securely saved onto your profile footprint parameters locally!</p>
              </div>
              <button onClick={() => setIsVaultOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 max-h-[380px] overflow-y-auto">
              {[
                { id: "cadet", label: "Cadet", icon: "🔰", bg: "from-teal-400 to-emerald-500", desc: "Joined flight deck staff.", count: badgeCounts.cadet },
                { id: "striker", label: "Quiz Striker", icon: "🔥", bg: "from-amber-400 to-orange-500", desc: "Hit correct quiz vectors.", count: badgeCounts.striker },
                { id: "commander", label: "Commander", icon: "👑", bg: "from-purple-500 to-indigo-600", desc: "Scored 4+ points standard.", count: badgeCounts.commander },
                { id: "perfect", label: "Perfect Clear", icon: "💎", bg: "from-pink-500 to-rose-600", desc: "Cleared a quiz with 100%.", count: badgeCounts.perfect },
                { id: "explorer", label: "Triple Launch", icon: "🚀", bg: "from-blue-400 to-indigo-600", desc: "Uploaded 3 visual image files.", count: badgeCounts.explorer },
                { id: "notetaker", label: "Scribe Master", icon: "📝", bg: "from-yellow-400 to-amber-500", desc: "Generated summary notes map.", count: badgeCounts.notetaker },
                { id: "explainer", label: "Simple Mind", icon: "👶", bg: "from-cyan-400 to-blue-500", desc: "Requested kid explainer guides.", count: badgeCounts.explainer },
                { id: "warrior", label: "Space Ranger", icon: "⚔️", bg: "from-red-500 to-orange-600", desc: "Destroyed Arena target anomalies.", count: badgeCounts.warrior },
              ].map((b, i) => (
                <div key={i} className={`border-2 rounded-2xl p-3 text-center flex flex-col items-center justify-between relative ${b.count > 0 ? 'border-indigo-100 bg-indigo-50/40 shadow-sm' : 'border-slate-100 bg-white opacity-40 filter grayscale select-none'}`}>
                  {b.count > 0 && <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white">x{b.count}</span>}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md border-2 border-white bg-gradient-to-br ${b.count > 0 ? b.bg : 'bg-slate-200'}`}>{b.icon}</div>
                  <div className="mt-2">
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-wide truncate max-w-[100px]">{b.label}</p>
                    <p className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GAMIFIED LOCK OVERLAY SCREEN */}
      {!subscriptionActive ? (
        <div className="flex-1 w-full flex items-center justify-center px-4 py-16 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border-4 border-indigo-600 w-full max-w-xl rounded-3xl p-8 shadow-2xl text-center space-y-6 transform scale-100 transition-all">
            <span className="text-7xl block animate-bounce select-none">⚡</span>
            <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 uppercase tracking-tight">Ready to Power Up Your Learning?</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-md mx-auto leading-relaxed">Your standard 30-day trial tank has run empty! Unlock your ultimate cosmic upgrade below to teleport directly past boring homework limits.</p>

            <div className="bg-indigo-50/60 border-2 border-indigo-100 rounded-2xl p-5 text-left space-y-3 shadow-inner">
              <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">🚀 UNLOCKED SUPER-POWERS INCLUDE:</h4>
              <ul className="text-xs text-slate-800 font-black space-y-2.5 pl-1">
                <li className="flex items-center gap-2.5"><span className="bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-md flex items-center justify-center">📝</span> <span>Create Magic Summary Study Notes instantly</span></li>
                <li className="flex items-center gap-2.5"><span className="bg-pink-500 text-white text-[10px] w-5 h-5 rounded-md flex items-center justify-center">👶</span> <span>Decode tough topics with Simple Kid Explainers</span></li>
                <li className="flex items-center gap-2.5"><span className="bg-amber-500 text-white text-[10px] w-5 h-5 rounded-md flex items-center justify-center">🎨</span> <span>Build custom, hero-themed Flashcard Decks</span></li>
                <li className="flex items-center gap-2.5"><span className="bg-purple-600 text-white text-[10px] w-5 h-5 rounded-md flex items-center justify-center">🧠</span> <span>Play Interactive Quizzes & hoard rare Vault Badges</span></li>
              </ul>
            </div>

            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Securely saves your level accomplishments across devices for the full 30 days cycle!</p>
            <button onClick={handleExecuteMonthlyPayment} disabled={isPaymentProcessing} className="w-full max-w-md bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white font-black py-4.5 rounded-2xl uppercase tracking-widest text-xs shadow-xl transition transform active:scale-95 border-b-4 border-indigo-800">
              {isPaymentProcessing ? "Engaging Hyperdrive Thrusters..." : "Activate Super-Flight License Mode! 🦁💥"}
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD UNLOCKED OPERATION BOX CONTAINER VIEWPORT */
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-5">
              <div>
                <h3 className="font-black tracking-wider text-xs uppercase text-indigo-900">Choose Your Game Mode!</h3>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Pick what you want the Space Tiger to do with your study files:</p>
              </div>
              <div className="flex flex-col gap-2.5">
                <button type="button" onClick={() => setActiveTab('notes')} className={getButtonClass('notes')}>📝 MAKE STUDY NOTES</button>
                <button type="button" onClick={() => setActiveTab('explainer')} className={getButtonClass('explainer')}>👶 SIMPLE EXPLAINER</button>
                <button type="button" onClick={() => setActiveTab('flashcard')} className={getButtonClass('flashcard')}>🎨 FLASHCARD HERO</button>
                <button type="button" onClick={() => setActiveTab('quiz')} className={getButtonClass('quiz')}>🧠 PLAY INTERACTIVE QUIZ</button>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col min-h-[550px]">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex-1 flex flex-col relative overflow-hidden">
              <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
                <span className="font-bold text-xs tracking-wider text-slate-400 uppercase">COSMIC_SCREEN.EXE</span>
                <span className="text-[10px] font-black uppercase bg-slate-50 text-pink-600 px-3 py-1 border border-slate-200 rounded-lg tracking-widest">🪐 CURRENT ROUTE: {activeTab}</span>
              </div>
              
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-inner overflow-y-auto font-medium text-xs leading-relaxed text-slate-700 relative">
                {isLoading ? (
                  <div className="h-full w-full flex flex-col items-center justify-center space-y-4 py-16">
                    <div className="w-48 h-48">
                      {rocketAnimation ? <Lottie animationData={rocketAnimation} loop={true} /> : <div className="text-6xl animate-bounce">🚀</div>}
                    </div>
                    <p className="text-xs font-black text-pink-500 uppercase tracking-widest animate-pulse">PREPARING FOR LIFTOFF...</p>
                  </div>
                ) : activeTab === 'flashcard' && flashcardDeck ? (
                  <div className="space-y-6 font-sans p-2">
                    <div>
                      <h2 className="text-xl font-black text-indigo-950 uppercase tracking-wide">🎴 {flashcardDeck.deck_title}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      {flashcardDeck.cards.map((card, idx) => (
                        <div key={idx} onClick={() => toggleCardFlip(idx)} className="h-44 w-full cursor-pointer [perspective:1000px] group">
                          <div style={{ transform: flippedCards[idx] ? 'rotateY(180deg)' : 'none', transformStyle: 'preserve-3d' }} className={`relative h-full w-full rounded-2xl border-2 shadow-sm transition-all duration-500 ${flippedCards[idx] ? 'border-indigo-500 bg-indigo-50' : 'bg-white border-slate-200 group-hover:border-indigo-300'}`}>
                            <div className="absolute inset-0 h-full w-full rounded-2xl p-5 bg-white flex flex-col justify-between" style={{ backfaceVisibility: 'hidden' }}>
                              <p className="text-sm font-black text-slate-800 text-center px-2 py-4">{card.front_side}</p>
                            </div>
                            <div className="absolute inset-0 h-full w-full rounded-2xl p-5 bg-indigo-50 flex flex-col justify-between" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                              <p className="text-xs font-extrabold text-indigo-950 text-center py-2">{card.back_side}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeTab === 'quiz' && structuredQuiz ? (
                  <div className="space-y-6 font-sans p-2 select-none">
                    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-wide">🏆 {structuredQuiz.quiz_title}</h2>
                      </div>
                    </div>

                    {!quizComplete ? (
                      <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-5 relative overflow-hidden">
                        <div className="py-2">
                          <h4 className="font-black text-base text-slate-800 leading-snug">🐯 Game Prompt: {currentQuestion.question}</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {currentQuestion.options.map((option, optIdx) => {
                            let cardStateStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30 transform hover:-translate-y-0.5";
                            if (selectedOption === optIdx) cardStateStyle = "bg-indigo-600 border-indigo-700 text-white shadow-md scale-[1.01]";
                            
                            if (hasAnsweredCurrent) {
                              if (optIdx === currentQuestion.correct_answer_index) cardStateStyle = "bg-emerald-500 border-emerald-600 text-white font-black shadow-lg animate-bounce";
                              else if (selectedOption === optIdx) cardStateStyle = "bg-rose-500 border-rose-600 text-white shadow-lg opacity-80";
                            }
                            return (
                              <button key={optIdx} onClick={() => handleOptionClick(optIdx)} disabled={hasAnsweredCurrent} className={`w-full py-4 px-5 rounded-2xl border-2 text-left text-xs font-black tracking-wide transition-all ${cardStateStyle}`}>
                                {option}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex justify-end pt-2">
                          {!hasAnsweredCurrent ? (
                            <button onClick={() => handleCheckAnswer(currentQuestion.correct_answer_index)} disabled={selectedOption === null} className="bg-indigo-600 hover:bg-pink-600 text-white font-black px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs shadow-md">Lock In Vector 🎯</button>
                          ) : (
                            <button onClick={handleNextQuestion} className="bg-purple-600 hover:bg-pink-600 text-white font-black px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs shadow-md">Next Sector 🚀</button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* 🌟 UPGRADED: DETAILED MISSION END COMPLETE REPORT SCREEN MATRIX */
                      <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-xl w-full max-w-2xl mx-auto space-y-6">
                        <div className="text-center space-y-2">
                          <span className="text-6xl block animate-pulse">📋</span>
                          <h3 className="text-2xl font-black uppercase tracking-wide text-indigo-950">Mission Review Report</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase">Captain Flight Performance Matrix Evaluation Log</p>
                        </div>

                        {/* High level macro stats blocks */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                          <div className="text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">CORRECT RESPONSES</span>
                            <span className="text-2xl font-extrabold text-emerald-500">{score} Questions</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase block">WRONG RESPONSES</span>
                            <span className="text-2xl font-extrabold text-rose-500">{structuredQuiz.questions.length - score} Questions</span>
                          </div>
                        </div>

                        {/* Itemized loop showing all questions asked with answer parameters */}
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                          {structuredQuiz.questions.map((q, qIdx) => {
                            const chosenIdx = userAnswersHistory[qIdx];
                            const isUserCorrect = Number(chosenIdx) === Number(q.correct_answer_index);
                            
                            return (
                              <div key={qIdx} className="bg-white border-2 border-slate-100 rounded-xl p-4 space-y-2.5 relative">
                                <div className="flex justify-between items-start gap-2">
                                  <h5 className="text-xs font-black text-slate-800 leading-tight">Q{qIdx + 1}: {q.question}</h5>
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                    isUserCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                  }`}>
                                    {isUserCorrect ? "CORRECT ✓" : "WRONG ✕"}
                                  </span>
                                </div>
                                <div className="text-[11px] space-y-1 font-bold pl-2 border-l-2 border-slate-200">
                                  <p className="text-slate-500">Your Choice: <span className={isUserCorrect ? 'text-emerald-600' : 'text-rose-500 font-black'}>{q.options[chosenIdx] || "Skipped Vector"}</span></p>
                                  {!isUserCorrect && (
                                    <p className="text-slate-600">Correct Answer: <span className="text-emerald-600 font-black">{q.options[q.correct_answer_index]}</span></p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-center pt-2">
                          <button 
                            onClick={() => { setStructuredQuiz(null); setQuizComplete(false); setUserAnswersHistory([]); }} 
                            className="w-full max-w-sm bg-indigo-600 hover:bg-pink-600 text-white font-black py-4 px-6 rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                          >
                            Return to Flight Deck 🐯
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : generatedText ? (
                  <div className="space-y-4 font-sans p-2">
                    <div className="flex justify-end py-1.5 border-b border-slate-200 mb-2">
                      <button onClick={handleDownloadPDF} className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-md uppercase tracking-widest">📥 Download PDF</button>
                    </div>
                    <div id="pdf-printable-area" className="space-y-3">
                      {generatedText.split('\n').map((line, i) => {
                        if (line.startsWith('##')) return <h5 key={i} className="text-purple-700 font-extrabold text-xs mt-3 pl-2 border-l-2 border-indigo-400 uppercase">{line.replace(/##/g, '').trim()}</h5>;
                        if (line.startsWith('#')) return <h4 key={i} className="text-indigo-900 font-black text-sm mt-5 border-b border-slate-200 pb-1 uppercase">{line.replace(/#/g, '').trim()}</h4>;
                        return <p key={i} className="my-1 font-bold text-slate-500 pl-1">{line}</p>;
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-20 select-none">
                    <span className="text-5xl mb-3">🐯</span>
                    <p className="text-sm font-black text-indigo-900 uppercase">Space Tiger Sandbox Terminal</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit} className="mt-4 space-y-3 font-sans">
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold rounded-xl px-3 py-2">
                        <span>📸 {file.name}</span>
                        <button type="button" onClick={() => removeAttachedFile(idx)} className="ml-2 font-black text-slate-400">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center bg-white border-2 border-slate-200 focus-within:border-indigo-500 rounded-xl p-2 gap-2">
                  <label className="p-3 bg-slate-50 border border-slate-200 hover:bg-pink-50 rounded-xl cursor-pointer shadow-sm">
                    📎<input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  <input type="text" className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 font-bold px-2" placeholder="Ask your Space-Tiger a question..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
                  <button type="submit" disabled={isLoading || (!userQuery.trim() && attachedFiles.length === 0)} className="bg-indigo-600 hover:bg-pink-600 text-white font-black p-2.5 px-5 rounded-xl text-xs uppercase tracking-widest">LAUNCH! 🚀</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}