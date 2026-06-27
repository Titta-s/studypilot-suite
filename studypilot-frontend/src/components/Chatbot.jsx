import React, { useState } from 'react';

export default function Chatbot({ username, onLogout }) {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes', 'explainer', 'quiz', 'flashcard'
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [generatedText, setGeneratedText] = useState('');
  const [structuredQuiz, setStructuredQuiz] = useState(null);
  
  // 🎴 FLASHCARD DECK CORE STATE
  const [flashcardDeck, setFlashcardDeck] = useState(null);
  const [flippedCards, setFlippedCards] = useState({}); 

  // 🧭 QUIZ GAME TRACKER STATE
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); 
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [userAnswersHistory, setUserAnswersHistory] = useState([]); 

  const [attachedFile, setAttachedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setAttachedFile(file);
    } else if (file) {
      alert("🛸 Please upload an image file (PNG/JPG) for the space tiger to inspect!");
    }
  };

  const removeAttachedFile = () => setAttachedFile(null);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userQuery.trim() && !attachedFile) return;
    
    setIsLoading(true);
    
    // Hard-wipe old display elements to keep views clean
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
    if (attachedFile) formData.append('file', attachedFile);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Space Station error! Status: ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
        const responseString = data.response.trim();
        
        // 1. Check if the payload is structured JSON (Quiz or Flashcard)
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
          // 2. Plain Text Markdown Responses (Notes or Explainer)
          setGeneratedText(data.response);
          
          // ✨ THE FIX: We inspect the ARRIVING headers from the backend to lock the tab active highlight state!
          if (responseString.includes('THE BIG PICTURE STORY') || responseString.includes('BREAKING IT DOWN')) {
            setActiveTab('explainer'); // Forces navigation state layout sync perfectly!
          } else if (responseString.includes('THE HIGH-LEVEL MAP') || responseString.includes('SECRET WORDS')) {
            setActiveTab('notes');
          }
        }
      } else {
        setGeneratedText("🛸 Something went wrong inside the space engine vision parameters.");
      }
    } catch (error) {
      setGeneratedText(`❌ CONNECTION BREAKDOWN: Make sure your Python backend server is running on port 8000!`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCardFlip = (cardIdx) => {
    setFlippedCards(prev => ({ ...prev, [cardIdx]: !prev[cardIdx] }));
  };

  const handleOptionClick = (optIdx) => {
    if (hasAnsweredCurrent) return; 
    setSelectedOption(optIdx);
  };

  const handleCheckAnswer = (correctIdx) => {
    if (selectedOption === null) return alert("🚀 Choose an option card to test your launch systems!");
    setHasAnsweredCurrent(true);
    setUserAnswersHistory(prev => [...prev, selectedOption]);

    if (Number(selectedOption) === Number(correctIdx)) {
      setScore(prev => prev + 1);
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
    }
  };

  const currentQuestion = structuredQuiz?.questions[currentQuestionIndex];

  const getButtonClass = (tabName) => {
    const baseClass = "w-full py-3.5 px-4 rounded-xl text-left text-xs font-black tracking-widest border-2 transition-all duration-150 transform active:scale-95 block clear-both select-none ";
    if (activeTab === tabName) {
      return baseClass + "bg-indigo-600 text-white shadow-lg border-indigo-400";
    }
    return baseClass + "text-slate-600 bg-slate-50 border-slate-200 hover:border-slate-300";
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans flex flex-col antialiased selection:bg-pink-500/30">
      
      {/* Space Nav Header */}
      <nav className="border-b-2 border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 group cursor-pointer">
          <img className="w-9 h-9" src="https://img.icons8.com/fluent/344/year-of-tiger.png" alt="Logo" />
          <span className="font-black text-xl tracking-wider uppercase bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">StudyPilot</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-5 border border-indigo-100 text-indigo-700 text-xs font-bold">
            Captain {username || 'Explorer'} 👩‍🚀
          </div>
          <button onClick={onLogout} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl transition">Exit Ship 🚪</button>
        </div>
      </nav>

      {/* Main Grid Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side Panel Cockpit Controls */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-5">
            <div>
              <h3 className="font-black tracking-wider text-xs uppercase text-indigo-900">Choose Your Game Mode!</h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Pick what you want the Space Tiger to do with your study files:</p>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={() => { setActiveTab('notes'); setGeneratedText(''); setStructuredQuiz(null); setFlashcardDeck(null); }} className={getButtonClass('notes')}>📝 MAKE STUDY NOTES</button>
              <button type="button" onClick={() => { setActiveTab('explainer'); setGeneratedText(''); setStructuredQuiz(null); setFlashcardDeck(null); }} className={getButtonClass('explainer')}>👶 SIMPLE EXPLAINER</button>
              <button type="button" onClick={() => { setActiveTab('flashcard'); setGeneratedText(''); setStructuredQuiz(null); setFlashcardDeck(null); }} className={getButtonClass('flashcard')}>🎨 FLASHCARD HERO</button>
              <button type="button" onClick={() => { setActiveTab('quiz'); setGeneratedText(''); setStructuredQuiz(null); setFlashcardDeck(null); }} className={getButtonClass('quiz')}>🧠 PLAY INTERACTIVE QUIZ</button>
            </div>
          </div>
        </div>

        {/* Right Sandbox Display Viewport Screen */}
        <div className="md:col-span-3 flex flex-col min-h-[550px]">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md flex-1 flex flex-col relative overflow-hidden">
            
            <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <span className="font-bold text-xs tracking-wider text-slate-400 uppercase">COSMIC_SCREEN.EXE</span>
              <span className="text-[10px] font-black uppercase bg-slate-50 text-pink-600 px-3 py-1 border border-slate-200 rounded-lg tracking-widest">🪐 CURRENT ROUTE: {activeTab}</span>
            </div>
            
            {/* Screen Display Area Canvas */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-inner overflow-y-auto font-medium text-xs leading-relaxed text-slate-700">
              {isLoading ? (
                <div className="h-full w-full flex flex-col items-center justify-center space-y-3 py-16">
                  <div className="w-12 h-12 border-4 border-t-transparent border-pink-500 rounded-full animate-spin"></div>
                  <p className="text-xs font-black text-pink-500 uppercase animate-pulse">🛸 Deploying space-tiger micro-agents across system ports...</p>
                </div>
              ) : activeTab === 'flashcard' && flashcardDeck ? (
                
                /* 🎴 FLASHCARD DECK ENGINE CANVAS */
                <div className="space-y-6 animate-fade-in font-sans p-2">
                  <div>
                    <h2 className="text-xl font-black text-indigo-950 uppercase tracking-wide">🎴 {flashcardDeck.deck_title || "SPACE FLASHCARDS"}</h2>
                    <p className="text-slate-500 text-[11px] font-bold mt-0.5">Click any transmission card box below to flip the memory matrix around!</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {flashcardDeck.cards.map((card, idx) => {
                      const isFlipped = !!flippedCards[idx];
                      return (
                        <div key={idx} onClick={() => toggleCardFlip(idx)} className="h-44 w-full cursor-pointer [perspective:1000px] group">
                          <div 
                            style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none', transformStyle: 'preserve-3d' }}
                            className={`relative h-full w-full rounded-2xl border-2 shadow-sm transition-all duration-500 ${isFlipped ? 'border-indigo-500 bg-indigo-50' : 'bg-white border-slate-200 group-hover:border-indigo-300'}`}
                          >
                            <div className="absolute inset-0 h-full w-full rounded-2xl p-5 bg-white flex flex-col justify-between" style={{ backfaceVisibility: 'hidden' }}>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded self-start">MODULE CLUE KEY {idx + 1}</span>
                              <p className="text-sm font-black text-slate-800 text-center px-2 py-4">{card.front_side}</p>
                              <span className="text-[9px] font-black text-indigo-500 text-center uppercase animate-pulse">👉 CLICK TO REVEAL DECODED FACT</span>
                            </div>
                            <div className="absolute inset-0 h-full w-full rounded-2xl p-5 bg-indigo-50 flex flex-col justify-between" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded self-start">DECODED DATA TRUTH</span>
                              <p className="text-xs font-extrabold text-indigo-950 leading-relaxed px-1 text-center py-2 flex-1 flex items-center justify-center">{card.back_side}</p>
                              <span className="text-[9px] font-black text-indigo-400 text-center uppercase">🎯 CLICK TO RE-LOCK MEMORY CELL</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              ) : activeTab === 'quiz' && structuredQuiz ? (
                
                <div className="space-y-6 animate-fade-in font-sans p-2">
                  <div className="border-b-2 border-purple-200 pb-2 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-purple-900 uppercase tracking-wide">🏆 {structuredQuiz.quiz_title}</h2>
                      <p className="text-slate-500 text-[11px] font-bold mt-0.5">Answer one question at a time to power up your starship boosters!</p>
                    </div>
                    {!quizComplete && (
                      <span className="bg-purple-100 text-purple-800 font-black px-3 py-1.5 rounded-xl border border-purple-200 uppercase tracking-wide text-[10px]">
                        🚀 Question: {currentQuestionIndex + 1} / {structuredQuiz.questions.length}
                      </span>
                    )}
                  </div>

                  {!quizComplete ? (
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 animate-fade-in">
                      <h4 className="font-black text-sm text-slate-800">🧑‍🚀 Task {currentQuestionIndex + 1}: {currentQuestion.question}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentQuestion.options.map((option, optIdx) => {
                          const isSelected = selectedOption === optIdx;
                          const isCorrect = Number(currentQuestion.correct_answer_index) === Number(optIdx);
                          
                          let btnStyle = "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700";
                          if (isSelected) btnStyle = "bg-purple-600 border-purple-700 text-white shadow-md";
                          
                          if (hasAnsweredCurrent) {
                            if (isCorrect) btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-sm font-black";
                            else if (isSelected && !isCorrect) btnStyle = "bg-rose-500 border-rose-600 text-white line-through opacity-70";
                            else btnStyle = "border-slate-100 bg-slate-50 text-slate-400 opacity-40 cursor-not-allowed";
                          }
                          return (
                            <button
                              key={optIdx} type="button" onClick={() => handleOptionClick(optIdx)} disabled={hasAnsweredCurrent}
                              className={`w-full py-3.5 px-4 rounded-xl border-2 text-left text-xs font-bold transition-all transform active:scale-[0.99] flex items-center gap-2 ${btnStyle}`}
                            >
                              <span className="bg-black/10 px-2 py-0.5 rounded text-[10px] font-black uppercase">{String.fromCharCode(65 + optIdx)}</span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        {!hasAnsweredCurrent ? (
                          <button
                            type="button" onClick={() => handleCheckAnswer(currentQuestion.correct_answer_index)} disabled={selectedOption === null}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white disabled:text-slate-400 font-black px-6 py-3 rounded-xl tracking-widest text-[10px] uppercase transition shadow-md"
                          >
                            VERIFY LAUNCH SELECTION 🎯
                          </button>
                        ) : (
                          <button
                            type="button" onClick={handleNextQuestion}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-3 rounded-xl tracking-widest text-[10px] uppercase transition shadow-md"
                          >
                            {currentQuestionIndex + 1 === structuredQuiz.questions.length ? "FINALIZE RECONCILIATION 🏁" : "UNLOCK NEXT TELEMETRY CONTAINER ➡️"}
                          </button>
                        )}
                      </div>

                      {hasAnsweredCurrent && (
                        <div className="mt-3 p-4 rounded-xl border animate-fade-in font-sans space-y-2 bg-white shadow-sm">
                          {Number(selectedOption) === Number(currentQuestion.correct_answer_index) ? (
                            <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-wide">🎉 CORRECT! Excellent tracking cadet!</div>
                          ) : (
                            <div className="space-y-1">
                              <div className="text-rose-600 font-black text-sm uppercase tracking-wide">❌ OOPS, WRONG CHOICE!</div>
                              <p className="text-[11px] font-bold text-slate-600">Right answer was option <strong className="text-emerald-500">{String.fromCharCode(65 + currentQuestion.correct_answer_index)}: "{currentQuestion.options[currentQuestion.correct_answer_index]}"</strong>!</p>
                            </div>
                          )}
                          <div className="text-[11px] font-bold text-purple-950 pt-2 border-t border-slate-100 leading-relaxed">⭐ <strong>Space Tiger Insights:</strong> {currentQuestion.explanation}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 animate-scale-up text-center font-sans max-w-xl mx-auto py-4 relative">
                      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden flex justify-around pointer-events-none text-xl opacity-40 select-none animate-pulse">
                        <span>✨</span><span>⭐</span><span>🚀</span><span>✨</span><span>🎉</span>
                      </div>

                      {score === structuredQuiz.questions.length ? (
                        <div className="p-6 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-white border-4 border-yellow-200 shadow-xl rounded-2xl space-y-3 relative overflow-hidden">
                          <span className="text-6xl block drop-shadow-md animate-bounce">🚀</span>
                          <h3 className="text-xl font-black tracking-widest uppercase">NEBULA ADVENTURER RANK UNLOCKED!</h3>
                          <p className="text-xs font-extrabold text-amber-950 max-w-sm mx-auto leading-normal">Incredible pilot work! You secured a flawless score of {score}/{structuredQuiz.questions.length} blocks, stabilizing fuel tanks perfectly!</p>
                          <span className="inline-block px-4 py-1 bg-white text-yellow-600 font-black text-[10px] rounded-full uppercase tracking-wider shadow">GOLDEN BADGE ACCREDITED 🏅</span>
                        </div>
                      ) : score > 0 ? (
                        <div className="p-6 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white border-4 border-purple-200 shadow-xl rounded-2xl space-y-3">
                          <span className="text-6xl block animate-pulse">🛰️</span>
                          <h3 className="text-xl font-black tracking-widest uppercase">STAR CADET IN TRAINING!</h3>
                          <p className="text-xs font-extrabold text-purple-950 max-w-sm mx-auto leading-normal">Booster engines generated {score} successful energy grid blocks! Keep practicing!</p>
                          <span className="inline-block px-4 py-1 bg-purple-950/40 text-purple-100 font-black text-[10px] rounded-full uppercase tracking-wider">SILVER BADGE LOCKED IN 🥈</span>
                        </div>
                      ) : (
                        <div className="p-6 bg-gradient-to-br from-slate-600 to-slate-800 text-white border-4 border-slate-500 shadow-xl rounded-2xl space-y-3">
                          <span className="text-6xl block">🛠️</span>
                          <h3 className="text-xl font-black tracking-widest uppercase">SHIP MECHANIC REPAIR STATUS</h3>
                          <p className="text-xs font-extrabold text-slate-300 max-w-sm mx-auto leading-normal">Let's flip back into our textbook notes page layout and study with the Space Tiger again!</p>
                          <span className="inline-block px-4 py-1 bg-slate-900 text-slate-400 font-black text-[10px] rounded-full uppercase tracking-wider">MAINTENANCE DECK INITIALIZED 🔧</span>
                        </div>
                      )}

                      <div className="space-y-3 text-left pt-2">
                        <h4 className="font-black text-xs uppercase text-slate-400 tracking-wider">Mission Log Analytics:</h4>
                        {structuredQuiz.questions.map((q, qIdx) => {
                          const savedUserChoiceIdx = userAnswersHistory[qIdx];
                          const correctIdx = q.correct_answer_index;
                          const wasRight = Number(savedUserChoiceIdx) === Number(correctIdx);
                          return (
                            <div key={qIdx} className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
                              <div className="flex items-start justify-between gap-4">
                                <h4 className="font-black text-xs text-slate-800">❓ Task {qIdx + 1}: {q.question}</h4>
                                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md text-white shrink-0 ${wasRight ? 'bg-emerald-500' : 'bg-rose-500'}`}>{wasRight ? '✓ SECURED' : '✗ OVERRIDE'}</span>
                              </div>
                              <div className="text-[11px] font-bold space-y-1 pt-1 text-slate-600 border-t border-dashed border-slate-100">
                                <p>Input Code: <span className={wasRight ? 'text-emerald-600' : 'text-rose-500'}>({String.fromCharCode(65 + savedUserChoiceIdx)}) {q.options[savedUserChoiceIdx]}</span></p>
                                {!wasRight && <p>Ground Truth Code: <span className="text-emerald-600">({String.fromCharCode(65 + correctIdx)}) {q.options[correctIdx]}</span></p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pt-2"><button type="button" onClick={() => { setStructuredQuiz(null); setGeneratedText(''); }} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition shadow-md">Clear Deck for New Mission</button></div>
                    </div>
                  )}
                </div>

              ) : generatedText ? (
                <div className="space-y-3 text-slate-700 font-sans p-2 animate-fade-in">
                  {generatedText.split('\n').map((line, i) => {
                    if (line.startsWith('#')) return <h4 key={i} className="text-indigo-900 font-black text-sm mt-4 border-b border-slate-200 pb-1 uppercase tracking-wide">{line.replace(/#/g, '').trim()}</h4>;
                    if (line.startsWith('*')) return <p key={i} className="pl-3 border-l-2 border-pink-500 my-1 font-bold">{line.replace(/\*/g, '').trim()}</p>;
                    return <p key={i} className="my-1 font-bold text-slate-600 leading-relaxed">{line}</p>;
                  })}
                </div>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-center py-20 select-none">
                  <span className="text-5xl mb-3 animate-bounce">🐯</span>
                  <p className="text-sm font-black text-indigo-900 uppercase tracking-widest">Space Tiger Sandbox Terminal</p>
                  <p className="text-xs max-w-xs mt-2 text-slate-500 font-sans font-bold leading-normal">Drop your textbook photo down into the tray attachment below to see the interactive study wizard magic happen!</p>
                </div>
              )}
            </div>

            {/* Form Input Tray Bar Tools */}
            <form onSubmit={handleChatSubmit} className="mt-4 space-y-3 font-sans">
              {attachedFile && (
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold rounded-xl px-3 py-2 shadow-sm max-w-xs animate-fade-in">
                  <span className="truncate">📸 {attachedFile.name}</span>
                  <button type="button" onClick={removeAttachedFile} className="ml-2 font-black text-slate-400 hover:text-red-500">✕</button>
                </div>
              )}

              <div className="flex items-center bg-white border-2 border-slate-200 focus-within:border-indigo-500 rounded-xl p-2 gap-2 transition-all duration-300">
                <label className="p-3 bg-slate-50 border border-slate-200 hover:bg-pink-50 rounded-xl cursor-pointer text-slate-500 flex items-center justify-center text-base shadow-sm active:scale-90" title="Upload an Image!">
                  📎<input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <input 
                  type="text" className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 font-bold placeholder-slate-400 px-2"
                  placeholder={attachedFile ? "Tell the space tiger how to analyze this picture!..." : "Ask your helper friend any school question here!..."}
                  value={userQuery} onChange={(e) => setUserQuery(e.target.value)}
                />
                <button type="submit" disabled={isLoading || (!userQuery.trim() && !attachedFile)} className="bg-indigo-600 hover:bg-pink-600 disabled:bg-slate-100 text-white font-black p-2.5 px-5 rounded-xl text-xs uppercase tracking-widest transition active:scale-90">LAUNCH! 🚀</button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}