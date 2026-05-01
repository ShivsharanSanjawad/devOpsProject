import React from 'react';
import { ArrowLeft, Zap, Clock, Trophy } from 'lucide-react';

const TopNav = ({ timeLeft, level }) => {
  return (
    <div className="h-16 border-b border-gray-800 bg-[#0f0f17] flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white transition-colors" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400" />
          <h1 className="text-xl text-white tracking-widest font-display uppercase">
            CTRL <span className="text-cyan-400">+</span> FIX IT <span className="text-gray-500 text-sm ml-2 font-sans tracking-normal">[{level}/5]</span>
          </h1>
        </div>
      </div>

      <div className={`flex items-center gap-2 px-4 py-1.5 border rounded-md transition-colors ${timeLeft.startsWith('00') ? 'bg-red-950/40 border-red-900/50 text-red-400 animate-pulse' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
        <Clock className="w-4 h-4" />
        <span className="font-mono text-lg font-bold tracking-widest">{timeLeft}</span>
      </div>

      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-900/20 border border-yellow-700/30 rounded-full">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-yellow-500 font-bold text-sm tracking-wide">1,250 XP</span>
        </div>
      </div>
    </div>
  );
};

export default TopNav;