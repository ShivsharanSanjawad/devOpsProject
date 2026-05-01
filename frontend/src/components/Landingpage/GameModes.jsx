import React from 'react';
import { Users, Bug, Shield } from 'lucide-react';

const GameModes = () => {
  return (
    <section id="modes" className="bg-[#05070a] min-h-screen flex items-center justify-center p-6 font-sans">
      <div className="max-w-6xl w-full">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 font-display">
              GAME <span className="text-cyan-400">MODES</span>
            </h2>
            <p className="text-slate-400 text-base">
              Choose your battlefield.
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-auto lg:h-[500px]">
          
          {/* Left Large Featured Card (Blitz Mode) */}
          <div className="relative overflow-hidden rounded-2xl group cursor-pointer border border-[#1a1f2e] hover:border-slate-700 transition-colors h-[400px] lg:h-full">
            {/* Background Image with Dark Gradient Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ 
                backgroundImage: 'url("https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop")' 
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/80 to-transparent"></div>

            {/* Content positioned at the bottom */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider w-fit mb-4">
                Live Now
              </span>
              
              <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-3 drop-shadow-lg">
                BLITZ MODE
              </h3>
              
              <p className="text-slate-300 text-sm leading-relaxed max-w-sm mb-6">
                Fast-paced 5-minute coding sprints. Solve easy to medium problems against 5 opponents. Speed is everything.
              </p>
            </div>
          </div>

          {/* Right Column: 3 Stacked Cards */}
          <div className="flex flex-col gap-4 h-full">
            
            {/* Mode 1: Squad vs Squad */}
            <div className="flex-1 bg-[#0b0f19] border border-[#1a1f2e] hover:border-purple-500/50 rounded-2xl p-6 flex flex-col justify-center cursor-pointer group transition-all hover:bg-[#0d121c]">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
                <Users size={18} className="text-purple-400" />
              </div>
              <h4 className="text-white font-bold text-lg mb-1.5 group-hover:text-purple-400 transition-colors">
                Squad vs Squad
              </h4>
              <p className="text-slate-400 text-sm leading-snug">
                3v3 Team Battles. Collaborative coding with shared editors and voice chat.
              </p>
            </div>

            {/* Mode 2: Code & Fix It */}
            <div className="flex-1 bg-[#0b0f19] border border-[#1a1f2e] hover:border-cyan-500/50 rounded-2xl p-6 flex flex-col justify-center cursor-pointer group transition-all hover:bg-[#0d121c]">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                <Bug size={18} className="text-cyan-400" />
              </div>
              <h4 className="text-white font-bold text-lg mb-1.5 group-hover:text-cyan-400 transition-colors">
                Code & Fix It
              </h4>
              <p className="text-slate-400 text-sm leading-snug">
                Debug broken codebases under time pressure. Find the bug, fix the logic.
              </p>
            </div>

            {/* Mode 3: Daily Arena */}
            <div className="flex-1 bg-[#0b0f19] border border-[#1a1f2e] hover:border-orange-500/50 rounded-2xl p-6 flex flex-col justify-center cursor-pointer group transition-all hover:bg-[#0d121c]">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3">
                <Shield size={18} className="text-orange-400" />
              </div>
              <h4 className="text-white font-bold text-lg mb-1.5 group-hover:text-orange-400 transition-colors">
                Daily Arena
              </h4>
              <p className="text-slate-400 text-sm leading-snug">
                Global leaderboard challenge. One problem, 24 hours, infinite attempts.
              </p>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
};

export default GameModes;