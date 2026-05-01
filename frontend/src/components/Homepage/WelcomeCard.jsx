import React from 'react';
import { TrendingUp, Flame, Trophy } from 'lucide-react';

const WelcomeCard = ({ profileData }) => {
  return (
    <div className="w-full bg-[#111322] border border-[#1e223b] rounded-2xl p-5 md:py-1 md:px-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-sans shadow-lg shadow-black/20">
      
      {/* Left Section: Greeting & Subtitle */}
      <div className="flex items-center gap-4">
        {/* Waving Hand Icon Box */}
        <div className="w-14 h-14 flex items-center justify-center bg-[#090b14] border border-[#1a1f36] rounded-xl text-2xl shadow-inner shrink-0 hover:rotate-12 transition-transform duration-300 cursor-pointer">
          👋
        </div>
        
        {/* Text Content */}
        <div className="flex flex-col">
          <h2 className="text-xl md:text-[22px] font-bold text-white tracking-wide mb-1">
            Welcome back, <span className="text-cyan-400">{profileData?.username || 'Gladiator'}</span>
          </h2>
          <div className="flex items-center gap-2">
            {/* Pulsing Green Dot */}
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-sm text-slate-400 font-medium">
              Ready to conquer the arena?
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Stats Row */}
      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto py-3 px-1 hide-scrollbar -mx-1">
        
        {/* Rating Stat (Cyan Theme on Hover) */}
        <div className="group bg-[#171a2e] border border-[#242846] rounded-xl px-5 py-2.5 min-w-[130px] flex-1 md:flex-none transition-all duration-300 hover:-translate-y-1 hover:bg-[#1a1e36] hover:border-cyan-500/40 hover:shadow-[0_8px_16px_-6px_rgba(34,211,238,0.2)] cursor-pointer">
          <span className="block text-[10px] font-black text-slate-400 group-hover:text-cyan-400/80 transition-colors uppercase tracking-widest mb-1.5">
            Rating
          </span>
          <div className="flex items-center gap-2 text-white font-bold text-lg group-hover:text-cyan-50 transition-colors">
            <TrendingUp size={18} className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            {profileData?.rating || 0}
          </div>
        </div>

        {/* Streak Stat (Orange Theme on Hover) */}
        <div className="group bg-[#171a2e] border border-[#242846] rounded-xl px-5 py-2.5 min-w-[130px] flex-1 md:flex-none transition-all duration-300 hover:-translate-y-1 hover:bg-[#1a1e36] hover:border-orange-500/40 hover:shadow-[0_8px_16px_-6px_rgba(249,115,22,0.2)] cursor-pointer">
          <span className="block text-[10px] font-black text-slate-400 group-hover:text-orange-400/80 transition-colors uppercase tracking-widest mb-1.5">
            Streak
          </span>
          <div className="flex items-center gap-2 text-white font-bold text-lg group-hover:text-orange-50 transition-colors">
            <Flame size={18} className="text-orange-500 fill-orange-500/20 group-hover:scale-110 transition-transform duration-300" />
            {profileData?.streak || 0} Days
          </div>
        </div>

        {/* Global Rank Stat (Yellow Theme on Hover) */}
        <div className="group bg-[#171a2e] border border-[#242846] rounded-xl px-5 py-2.5 min-w-[130px] flex-1 md:flex-none transition-all duration-300 hover:-translate-y-1 hover:bg-[#1a1e36] hover:border-yellow-500/40 hover:shadow-[0_8px_16px_-6px_rgba(234,179,8,0.2)] cursor-pointer">
          <span className="block text-[10px] font-black text-slate-400 group-hover:text-yellow-400/80 transition-colors uppercase tracking-widest mb-1.5">
            Global Rank
          </span>
          <div className="flex items-center gap-2 text-white font-bold text-lg group-hover:text-yellow-50 transition-colors">
            <Trophy size={18} className="text-yellow-500 fill-yellow-500/20 group-hover:scale-110 transition-transform duration-300" />
            #{profileData?.globalRank || '---'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WelcomeCard;