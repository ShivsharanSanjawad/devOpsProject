import React from 'react';
import {
  Gamepad2,
  AlertCircle,
  BugOff,
  CheckCircle2,
  Zap,
  ArrowRight,
  Wrench
} from 'lucide-react';
import { Link } from 'react-router-dom';

const GameModes = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-16 text-white font-sans">

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-purple-400" />
          <h2 className="text-3xl md:text-4xl uppercase tracking-wide text-white font-display">
            Game Modes
          </h2>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Card 1: 1v1 Battle Royale (Purple Theme) */}
        <div className="group relative rounded-2xl bg-[#110a1f] border border-purple-600/30 p-8 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-purple-500 hover:shadow-[0_0_50px_-12px_rgba(168,85,247,0.6)] overflow-hidden cursor-pointer flex flex-col h-full">
          {/* Faint Background Glow/Image Simulation */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 flex-grow">
            {/* Header: Icon */}
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-purple-600 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-all duration-300 group-hover:-translate-y-1">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Content */}
            {/* Added text-white font-display here */}
            <h3 className="text-2xl mb-3 text-white font-display group-hover:text-purple-300 transition-colors">
              1v1 Battle Royale
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Real-time coding duel against another player. First to solve correctly wins the glory.
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {['Live timer & synchronized start', 'Same problem difficulty for both players', 'Real-time submission tracking & diff view', 'Ranked leaderboard (ELO system)'].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Button */}
          {/* Also added font-display to the button to match the aggressive styling */}
          <Link to='/battle'>
            <button className="relative z-10 w-full py-4 mt-auto bg-purple-600 hover:bg-purple-500 rounded-xl tracking-wider uppercase transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2 text-white font-display text-sm">
              Enter Arena
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Card 2: Ctrl + Fix It (Cyan/Blue Theme) */}
        <div className="group relative rounded-2xl bg-[#0a1120] border border-blue-600/30 p-8 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-cyan-400 hover:shadow-[0_0_50px_-12px_rgba(6,182,212,0.6)] overflow-hidden cursor-pointer flex flex-col h-full">
          {/* Faint Background Glow/Image Simulation */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 flex-grow">
            {/* Header: Icon & Badge */}
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-500 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all duration-300 group-hover:-translate-y-1">
                <BugOff className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Fast Paced</span>
              </div>
            </div>

            {/* Content */}
            {/* Added text-white font-display here */}
            <h3 className="text-2xl mb-3 text-white font-display group-hover:text-cyan-300 transition-colors">
              Ctrl + Fix It
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Find and fix broken code before time runs out. Speed and accuracy are your weapons.
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {['Intense debugging challenges', 'Time-based scoring multiplier', 'Increasing difficulty levels (Boss Bugs)', 'Streak bonuses for clean fixes'].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Button */}
          {/* Also added font-display to the button */}
          <Link to='/ctrl-fix-it'>
            <button className="relative z-10 w-full py-4 mt-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl tracking-wider uppercase transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 text-white font-display text-sm">
              Start Fixing
              <Wrench className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
            </button>
          </Link>

        </div>

      </div>
    </div>
  );
};

export default GameModes;