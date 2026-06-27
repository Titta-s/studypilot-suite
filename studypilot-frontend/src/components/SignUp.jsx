import React, { useState } from 'react';

export default function SignUp({ onNavigateToLogin }) {
  const [newUsername, setNewUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    alert(`🎉 Account created successfully for Cadet ${newUsername}! Returning to launchpad.`);
    onNavigateToLogin();
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 flex flex-col justify-center items-center font-sans antialiased p-4 selection:bg-pink-500/30">
      <div className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_60px_rgba(129,140,248,0.25)] border-2 border-indigo-500/30 transition-all duration-300 hover:border-pink-500/40 transform hover:scale-[1.01]">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black tracking-wider text-white uppercase bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent drop-shadow">
            Cadet Registry
          </h2>
          <p className="text-xs font-bold text-indigo-300 tracking-widest mt-1 uppercase">Create Your Space Passport 🧑‍🚀</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-black uppercase tracking-widest text-yellow-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              🛸 Chosen Username
            </label>
            <input 
              className="w-full px-4 py-3 text-slate-100 border-2 border-slate-800 rounded-2xl bg-slate-950/80 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all font-bold text-sm placeholder-slate-500 shadow-inner" 
              type="text" 
              placeholder="Pick an awesome callsign..."
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-black uppercase tracking-widest text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              📧 Interstellar Email
            </label>
            <input 
              className="w-full px-4 py-3 text-slate-100 border-2 border-slate-800 rounded-2xl bg-slate-950/80 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all font-bold text-sm placeholder-slate-500 shadow-inner" 
              type="email" 
              placeholder="cadet@galaxy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-black uppercase tracking-widest text-indigo-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              🔒 Create Passcode
            </label>
            <input 
              className="w-full px-4 py-3 text-slate-100 border-2 border-slate-800 rounded-2xl bg-slate-950/80 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all font-mono text-sm placeholder-slate-600 shadow-inner" 
              type="password" 
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button 
            className="w-full mt-2 relative group overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white font-black text-sm tracking-widest py-3.5 px-4 rounded-2xl transition duration-300 shadow-xl shadow-purple-500/30 active:scale-[0.97]" 
            type="submit"
          >
            CREATE PASSPORT 🚀
          </button>
        </form>

        <footer className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] font-bold">
          <span className="text-slate-500">Already have a launch code? </span>
          <button 
            type="button"
            onClick={onNavigateToLogin} 
            className="text-yellow-400 hover:text-yellow-300 transition-colors underline"
          >
            Go to Launchpad
          </button>
        </footer>

      </div>
    </div>
  );
}