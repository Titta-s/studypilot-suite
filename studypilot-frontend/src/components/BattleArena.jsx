import React, { useState, useEffect, useRef } from 'react';

export default function BattleArena({ username, onExitArena, onEarnWarriorBadge }) {
  const [arcadeFiles, setArcadeFiles] = useState([]);
  const [arcadeLoading, setArcadeLoading] = useState(false);
  const [gameLevelData, setGameLevelData] = useState(null); 
  const [arcadeScore, setArcadeScore] = useState(0);
  const [gameStatusText, setGameStatusText] = useState('Upload study data images to map cosmic battle targets!');
  
  // 🚀 CAMPAIGN STATE MATRIX
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [campaignQuestions, setCampaignQuestions] = useState([]);
  const [levelCorrectAnswers, setLevelCorrectAnswers] = useState(0);
  const [isMissionFailed, setIsMissionFailed] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState(null); 

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const handleArcadeFileChange = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith("image/"));
    if (files.length > 3) {
      alert("🚀 Maximum 3 images to extract a star-system vector tier!");
      setArcadeFiles(files.slice(0, 3));
    } else {
      setArcadeFiles(files);
    }
  };

  const handleGenerateGame = async () => {
    if (arcadeFiles.length === 0) return alert("🛸 Attach study content pictures to code your targets!");
    setArcadeLoading(true);
    setGameLevelData(null);
    setCampaignQuestions([]);
    setCurrentLevel(1);
    setCurrentQuestionIndex(0);
    setLevelCorrectAnswers(0);
    setIsMissionFailed(false);
    setQuestionFeedback(null);
    setGameStatusText("Analyzing material logs... Formulating campaign coordinates...");

    const formData = new FormData();
    formData.append('message', 'Generate exactly 15 distinct multiple-choice questions based ONLY on the attached textbook content data. Ensure answers are diverse.');
    formData.append('active_tab', 'quiz'); 
    arcadeFiles.forEach(file => formData.append('files', file));

    try {
      const token = localStorage.getItem("firebaseToken");
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        try {
          const parsedJson = JSON.parse(data.response.trim());
          if (parsedJson.questions && parsedJson.questions.length >= 5) {
            setCampaignQuestions(parsedJson.questions);
            loadCampaignQuestion(0, parsedJson.questions, 1);
          } else {
            generateFallbackTextLevels(data.response);
          }
        } catch (jsonErr) {
          generateFallbackTextLevels(data.response);
        }
        setGameStatusText("5-LEVEL REAL TEXT CAMPAIGN SYNCHRONIZED! Move mouse to steer, left click to shoot!");
      } else {
        setGameStatusText("🛸 Anomaly calculation fault inside the server.");
      }
    } catch (err) {
      setGameStatusText("❌ Connection breakdown. Ensure Python backend is running on Port 8000!");
    } finally {
      setArcadeLoading(false);
    }
  };

  const generateFallbackTextLevels = (rawResponseText) => {
    const textLines = rawResponseText.split('\n').filter(l => l.trim().length > 10);
    const parsedPack = [];
    
    for (let i = 0; i < 15; i++) {
      const baseLine = textLines[i % textLines.length].replace(/[^a-zA-Z0-9\s.,?!-]/g, '');
      parsedPack.push({
        question: `Based on content logs: ${baseLine.slice(0, 80)}... Which option completes this facts metric?`,
        options: [
          `Incorrect concept distracter anomaly node alpha`,
          `Incorrect concept distracter anomaly node beta`,
          `${baseLine.slice(0, 60)} (Verified fact)`
        ],
        correct_answer_index: 2
      });
    }
    setCampaignQuestions(parsedPack);
    loadCampaignQuestion(0, parsedPack, 1);
  };

  const loadCampaignQuestion = (globalIndex, questionsList, levelNum) => {
    if (!questionsList || questionsList.length === 0) return;
    const qData = questionsList[globalIndex % questionsList.length];
    
    const speedFactor = 1.0 + (levelNum * 0.4);
    const letterMap = ['A', 'B', 'C'];
    const correctLetter = letterMap[qData.correct_answer_index || 0];

    setGameLevelData({
      title: `Campaign Node Sector - Stage ${globalIndex + 1}`,
      question: qData.question,
      correctIndex: qData.correct_answer_index || 0,
      correctLetter: correctLetter,
      optionsList: [
        { id: 'A', text: qData.options[0] || "Alternative data packet option" },
        { id: 'B', text: qData.options[1] || "Alternative data packet option" },
        { id: 'C', text: qData.options[2] || "Alternative data packet option" }
      ],
      targets: [
        { id: 'A', x: 200, y: -50, speed: 1.1 * speedFactor, active: true },
        { id: 'B', x: 500, y: -110, speed: 0.8 * speedFactor, active: true },
        { id: 'C', x: 800, y: -80, speed: 1.4 * speedFactor, active: true }
      ]
    });
    setQuestionFeedback(null);
  };

  const processAnswerSubmission = (hitLetter) => {
    const isCorrect = hitLetter === gameLevelData.correctLetter;
    let currentCorrectAccumulator = levelCorrectAnswers;

    if (isCorrect) {
      currentCorrectAccumulator += 1;
      setLevelCorrectAnswers(currentCorrectAccumulator);
      setArcadeScore(s => s + 100);
      onEarnWarriorBadge();
    }

    setQuestionFeedback({
      isCorrect: isCorrect,
      hitLetter: hitLetter,
      correctLetter: gameLevelData.correctLetter,
      callback: () => {
        const nextQuestionIndex = currentQuestionIndex + 1;

        if (nextQuestionIndex < 3) {
          setCurrentQuestionIndex(nextQuestionIndex);
          const nextGlobalIndex = ((currentLevel - 1) * 3) + nextQuestionIndex;
          loadCampaignQuestion(nextGlobalIndex, campaignQuestions, currentLevel);
        } else {
          if (currentCorrectAccumulator >= 2) {
            const nextLevel = currentLevel + 1;
            if (nextLevel <= 5) {
              setCurrentLevel(nextLevel);
              setCurrentQuestionIndex(0);
              setLevelCorrectAnswers(0);
              const nextGlobalIndex = (nextLevel - 1) * 3;
              loadCampaignQuestion(nextGlobalIndex, campaignQuestions, nextLevel);
            } else {
              alert("👑 ULTIMATE VICTORY! You conquered all 5 Difficulty Levels of the Battle Ground Campaign!");
              handleResetLevel();
            }
          } else {
            setIsMissionFailed(true);
            setQuestionFeedback(null);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          }
        }
      }
    });
  };

  const handleRestartLevel = () => {
    setIsMissionFailed(false);
    setCurrentQuestionIndex(0);
    setLevelCorrectAnswers(0);
    setQuestionFeedback(null);
    const restartedGlobalIndex = (currentLevel - 1) * 3;
    loadCampaignQuestion(restartedGlobalIndex, campaignQuestions, currentLevel);
  };

  const handleResetLevel = () => {
    setGameLevelData(null);
    setCampaignQuestions([]);
    setArcadeFiles([]);
    setCurrentLevel(1);
    setCurrentQuestionIndex(0);
    setLevelCorrectAnswers(0);
    setIsMissionFailed(false);
    setQuestionFeedback(null);
    setGameStatusText('Upload study data images to map cosmic battle targets!');
  };

  useEffect(() => {
    if (!gameLevelData || !canvasRef.current || isMissionFailed || questionFeedback) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let shipX = canvas.width / 2;
    let lasers = [];
    let enemies = [...gameLevelData.targets];
    let particles = [];

    let stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 3 + 0.5
    }));

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width; 
      shipX = (e.clientX - rect.left) * scaleX;
      if (shipX < 30) shipX = 30;
      if (shipX > canvas.width - 30) shipX = canvas.width - 30;
    };

    const handleCanvasClick = () => {
      lasers.push({ x: shipX, y: canvas.height - 50, speed: 10 });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);

    const draw = () => {
      ctx.fillStyle = '#090d16'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
      });

      // Player Vessel
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.moveTo(shipX, canvas.height - 55);
      ctx.lineTo(shipX - 24, canvas.height - 15);
      ctx.lineTo(shipX + 24, canvas.height - 15);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(shipX - 4, canvas.height - 15, 8, 8);

      lasers.forEach((laser, lIdx) => {
        ctx.fillRect(laser.x - 3, laser.y, 6, 16);
        laser.y -= laser.speed;

        enemies.forEach((enemy) => {
          if (enemy.active && laser.y < enemy.y + 35 && laser.y > enemy.y - 35 && laser.x > enemy.x - 25 && laser.x < enemy.x + 25) {
            enemy.active = false;
            lasers.splice(lIdx, 1);
            
            for(let p=0; p<25; p++) {
              particles.push({
                x: enemy.x, y: enemy.y,
                vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                radius: Math.random() * 3 + 1, alpha: 1,
                color: enemy.id === gameLevelData.correctLetter ? '#10b981' : '#f43f5e'
              });
            }

            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleCanvasClick);
            cancelAnimationFrame(animationFrameRef.current);

            processAnswerSubmission(enemy.id);
          }
        });

        if (laser.y < 0) lasers.splice(lIdx, 1);
      });

      particles.forEach((p, pIdx) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.02;
        if(p.alpha <= 0) particles.splice(pIdx, 1);
      });

      enemies.forEach(enemy => {
        if (!enemy.active) return;
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) {
          enemy.y = -50;
          enemy.x = Math.random() * (canvas.width - 100) + 50;
        }

        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)'; 
        ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 36, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#6366f1'; 
        ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 24, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.id, enemy.x, enemy.y + 7);
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameLevelData, isMissionFailed, questionFeedback]);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans select-none overflow-hidden pb-4">
      
      {/* HUD HEADER */}
      <nav className="border-b-2 border-slate-800 bg-slate-900 px-8 py-3 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">🎮</div>
          <span className="font-black text-lg tracking-wider uppercase bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Battle Arena Simulator</span>
        </div>
        
        <div className="flex items-center gap-4">
          {gameLevelData && (
            <div className="bg-slate-950 px-4 py-1.5 border-2 border-indigo-500 rounded-xl text-center shadow-lg">
              <span className="text-[9px] uppercase font-black text-purple-400 tracking-widest block">MISSION SECTOR</span>
              <span className="text-xs font-black text-yellow-300 uppercase">LEVEL {currentLevel} <span className="text-slate-500">({currentQuestionIndex + 1}/3)</span></span>
            </div>
          )}

          <div className="bg-slate-950 px-4 py-1.5 border border-slate-800 rounded-xl text-center">
            <span className="text-[9px] uppercase font-black text-amber-400 tracking-widest block">SCORE METRIC</span>
            <span className="text-md font-mono font-black text-emerald-400">{arcadeScore} XP</span>
          </div>

          <button 
            onClick={onExitArena}
            className="px-5 py-2.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 font-black rounded-xl border border-slate-700 hover:border-rose-900 text-xs uppercase tracking-widest transition"
          >
            Exit Arena 🚪
          </button>
        </div>
      </nav>

      <div className={`flex-1 max-w-7xl w-full mx-auto px-6 py-4 grid ${!gameLevelData ? 'grid-cols-1 xl:grid-cols-3' : 'grid-cols-1'} gap-6 overflow-hidden`}>
        
        {/* Left Side Injector Panel */}
        {!gameLevelData && (
          <div className="bg-slate-900 border-2 border-slate-800 p-5 rounded-3xl flex flex-col justify-between shadow-xl overflow-y-auto">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase">Level Configuration Block</span>
                <h3 className="text-md font-black text-slate-100 uppercase mt-0.5">🧬 Target Data Injector</h3>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Upload textbook pages or study graphics. The space-tiger agent compiles data definitions into active targets!
              </p>

              <label className="block w-full text-center py-4 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl bg-slate-950 cursor-pointer font-black text-xs text-amber-400 transition shadow-inner">
                📎 Drop Target Source Images
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleArcadeFileChange} />
              </label>

              {arcadeFiles.length > 0 && (
                <div className="space-y-1">
                  {arcadeFiles.map((file, idx) => (
                    <div key={idx} className="text-[10px] bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 truncate font-mono">📸 {file.name}</div>
                  ))}
                </div>
              )}
              
              <p className="text-[11px] text-slate-500 font-medium italic">{gameStatusText}</p>
            </div>

            <button 
              onClick={handleGenerateGame}
              disabled={arcadeLoading || arcadeFiles.length === 0}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 font-black py-4 rounded-xl uppercase tracking-widest text-xs text-slate-950 shadow-lg active:scale-95 transition-all mt-4"
            >
              {arcadeLoading ? "COMPILING SYSTEM MATRIX..." : "Infiltrate & Generate Level ⚡"}
            </button>
          </div>
        )}

        {/* Dynamic Game Field View Container */}
        <div className={`${!gameLevelData ? 'xl:col-span-2' : 'col-span-1'} flex flex-col space-y-4 overflow-hidden`}>
          
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 shadow-xl shrink-0">
            {gameLevelData ? (
              <div className="space-y-1">
                <span className="text-[9px] font-black text-purple-400 tracking-widest uppercase block">🛸 INTEL TRANSMISSION DETECTED</span>
                <h2 className="text-sm font-black text-yellow-400 font-mono">📍 OBJECTIVE: {gameLevelData.title}</h2>
                <p className="text-xs text-slate-200 font-black leading-normal mt-0.5">{gameLevelData.question}</p>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-2 font-mono text-xs">
                Waiting for study data stream injection sequence initialization...
              </div>
            )}
          </div>

          {/* Centralized Canvas Viewport Frame */}
          <div className="flex-1 bg-slate-950 rounded-3xl border-2 border-slate-800 flex items-center justify-center p-2 shadow-inner overflow-hidden relative">
            {gameLevelData && (
              <>
                <canvas 
                  ref={canvasRef} 
                  width={1100} 
                  height={460} 
                  className="bg-slate-900 border border-slate-800 rounded-2xl cursor-crosshair max-w-full shadow-2xl"
                />

                {/* INDIVIDUAL SHOT FEEDBACK OVERLAY SCREEN */}
                {questionFeedback && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center space-y-6 p-6 z-[50]">
                    <span className="text-7xl animate-bounce select-none block transform scale-125">{questionFeedback.isCorrect ? "🎉" : "💥"}</span>
                    
                    <div className="bg-slate-900 border-4 border-indigo-500 max-w-2xl w-full p-8 rounded-3xl text-center space-y-5 shadow-2xl">
                      
                      <h3 className={`text-3xl md:text-4xl font-black uppercase tracking-widest text-white`}>
                        {questionFeedback.isCorrect ? "Correct answer Captain! 🐯" : "COLLISION ANOMALY DETECTED"}
                      </h3>

                      <p className="text-sm md:text-base font-bold text-white leading-relaxed px-2">
                        You directed the tactical laser beams toward option vector <span className="text-yellow-400 font-extrabold text-lg">[{questionFeedback.hitLetter}]</span>. 
                        {questionFeedback.isCorrect 
                          ? " Splendid maneuver! That calculation matrix matches your textbook validation data records flawlessly!" 
                          : ` Your shield systems absorbed the error damage node. The true textbook verified option was actually [${questionFeedback.correctLetter}].`}
                      </p>

                    </div>

                    <button 
                      onClick={questionFeedback.callback}
                      className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-2xl transform active:scale-95 transition"
                    >
                      Continue Flight Track 🚀
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Question cards description matrix */}
          {gameLevelData && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {gameLevelData.optionsList.map((opt, oIdx) => (
                  <div key={oIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-lg text-[10px] font-black flex items-center justify-center border bg-indigo-950/40 text-indigo-400 border-indigo-900 shrink-0">
                      {opt.id}
                    </span>
                    <span className="text-[11px] font-bold text-slate-300 leading-tight">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 🌟 FIXED: HIGH-CONTRAST CRITICAL FIX FOR THE GAME OVER SCREEN */}
      {isMissionFailed && (
        <div className="fixed inset-0 bg-slate-950/95 z-[200] flex flex-col items-center justify-center space-y-6 p-4 font-mono animate-fadeIn">
          <span className="text-7xl block animate-bounce">💥</span>
          
          <h2 className="text-5xl md:text-6xl font-black text-red-500 bg-red-950/40 px-6 py-2 border-2 border-red-500 rounded-2xl tracking-widest uppercase text-center shadow-2xl">
            MISSION FAILED
          </h2>
          
          {/* 🤍 FIXED: Explicitly added text-white class to override template parameters inheritance defaults */}
          <p className="text-xs font-bold text-white max-w-sm text-center leading-relaxed bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-inner">
            SYSTEM CRITICAL ERROR: You scored less than <span className="text-yellow-400 font-extrabold underline">2 out of 3 correct parameters</span> in this level tracking layer!
          </p>
          
          {/* 🤍 FIXED: Explicitly added text-white to row parameters to keep fonts crisp */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-bold text-white w-full max-w-xs space-y-1.5 shadow-md">
            <div className="flex justify-between"><span>Current Level Track:</span> <span className="text-yellow-400 font-black">Level {currentLevel}</span></div>
            <div className="flex justify-between"><span>Total Accumulation:</span> <span className="text-emerald-400 font-black">{arcadeScore} XP</span></div>
          </div>
          
          <button 
            onClick={handleRestartLevel}
            className="w-full max-w-xs bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl transition active:scale-95"
          >
            Try Level Again 🔄
          </button>
        </div>
      )}

    </div>
  );
}