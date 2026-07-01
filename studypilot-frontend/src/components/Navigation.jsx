import React from 'react';

export default function Navigation({ username, onLogout, currentView, onViewChange, score = 0 }) {
  // 🌟 Calculate Rank and Unlocked Badges dynamically based on their XP score
  const totalXP = score * 100;
  
  return (
    <nav className="border-b-2 border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm font-sans">
      
      {/* Left Brand Area */}
      <div 
        onClick={() => onViewChange('chat')} 
        className="flex items-center gap-3 group cursor-pointer select-none"
      >
        <img className="w-9 h-9" src="https://img.icons8.com/fluent/344/year-of-tiger.png" alt="Logo" />
        <span className="font-black text-xl tracking-wider uppercase bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          StudyPilot
        </span>
      </div>

      {/* 🏅 NEW: CENTER-RIGHT TOP NAVIGATION BADGES INSIGNIA ROW */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1.5 shadow-inner select-none">
        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mr-1">Badges:</span>
        
        {/* Badge 1: Welcome Cadet (Always Unlocked for signing up) */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-sm transition hover:scale-105" title="Completed registry passport profile initialization!">
          <span>🔰</span>
          <span className="text-[10px] font-black tracking-wide uppercase text-slate-500">Cadet</span>
        </div>

        {/* Badge 2: Quiz Champion (Unlocks if they score at least 1 correct answer) */}
        <div className={`flex items-center gap-1 border rounded-xl px-2 py-0.5 text-[11px] font-bold shadow-sm transition duration-200 hover:scale-105 ${
          score > 0 
            ? "bg-amber-50 border-amber-200 text-amber-700 font-extrabold" 
            : "bg-slate-100/60 border-slate-200 text-slate-400 opacity-40 filter grayscale"
        }`} title={score > 0 ? "Unlocked: Scored correct answers on a Quiz Mission!" : "Locked: Score points on an Interactive Quiz to unlock!"}>
          <span>🔥</span>
          <span className="text-[10px] font-black tracking-wide uppercase">Striker</span>
        </div>

        {/* Badge 3: Galaxy Elite Commander (Unlocks if they score 4 or more points) */}
        <div className={`flex items-center gap-1 border rounded-xl px-2 py-0.5 text-[11px] font-bold shadow-sm transition duration-200 hover:scale-105 ${
          score >= 4 
            ? "bg-purple-50 border-purple-200 text-purple-700 font-extrabold" 
            : "bg-slate-100/60 border-slate-200 text-slate-400 opacity-40 filter grayscale"
        }`} title={score >= 4 ? "Unlocked: Achieved premium validation parameters rank!" : "Locked: Reach 4+ correct answers to earn elite rank!"}>
          <span>👑</span>
          <span className="text-[10px] font-black tracking-wide uppercase">Commander</span>
        </div>
      </div>

      {/* Right Navigation & Telemetry Badges Area */}
      <div className="flex items-center gap-4">
        {/* Toggle View Button directly in the Top Navbar */}
        <button
          onClick={() => onViewChange(currentView === 'chat' ? 'badges' : 'chat')}
          className={`px-4 py-1.5 text-xs font-black tracking-widest uppercase rounded-xl border-2 transition-all duration-150 transform active:scale-95 flex items-center gap-2 ${
            currentView === 'badges'
              ? 'bg-purple-600 text-white border-purple-700 shadow-md'
              : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
          }`}
        >
          {currentView === 'chat' ? '🏅 View Fleet Stats' : '💬 Back to Flight Deck'}
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-5 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-sm">
          Captain {username || 'Explorer'} 👩‍🚀
        </div>

        <button 
          onClick={onLogout} 
          className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-200 transition shadow-sm"
        >
          Exit Ship 🚪
        </button>
      </div>
    </nav>
  );
}