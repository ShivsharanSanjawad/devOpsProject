import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Trophy, Skull, Rocket, ArrowRight, Zap, MapPin, Code } from 'lucide-react';

const gameModes = [
  {
    id: '1v1',
    title: "1v1 Battle",
    description: "Challenge a random opponent to a coding duel.",
    icon: Target,
    buttonText: "Enter Arena",
    buttonIcon: ArrowRight,
    isLive: false,
    bgImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop", // Abstract dark code
    theme: {
      border: "border-purple-500/20 hover:border-purple-500/50",
      shadow: "hover:shadow-[0_15px_30px_-10px_rgba(168,85,247,0.3)]",
      iconBg: "bg-[#130f1e] border-purple-500/30",
      iconColor: "text-purple-400",
      btnBg: "bg-[#9333ea] hover:bg-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.3)]",
      imageTint: "bg-purple-500/20" // Adds a subtle purple wash to the image
    }
  },
  {
    id: 'weekly',
    title: "Weekly Contest",
    description: "Global Rank #124 • 1,204 Participants",
    icon: Trophy,
    buttonText: "Join Contest",
    buttonIcon: Zap,
    isLive: true,
    bgImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop", // Retro PC setup
    theme: {
      border: "border-cyan-500/20 hover:border-cyan-500/50",
      shadow: "hover:shadow-[0_15px_30px_-10px_rgba(6,182,212,0.3)]",
      iconBg: "bg-[#0b131a] border-cyan-500/30",
      iconColor: "text-cyan-400",
      btnBg: "bg-[#0891b2] hover:bg-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.3)]",
      imageTint: "bg-cyan-500/20" 
    }
  },
  {
    id: 'royale',
    title: "Battle Arena",
    description: "Last coder standing wins. 50 players max.",
    icon: Skull,
    buttonText: "Drop In",
    buttonIcon: MapPin,
    isLive: false,
    bgImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop", // E-sports Arena
    theme: {
      border: "border-pink-500/20 hover:border-pink-500/50",
      shadow: "hover:shadow-[0_15px_30px_-10px_rgba(236,72,153,0.3)]",
      iconBg: "bg-[#180e15] border-pink-500/30",
      iconColor: "text-pink-400",
      btnBg: "bg-[#db2777] hover:bg-[#ec4899] shadow-[0_0_15px_rgba(236,72,153,0.3)]",
      imageTint: "bg-pink-500/20"
    }
  },
  {
    id: 'practice',
    title: "Practice Dojo",
    description: "Master algorithms at your own pace.",
    icon: Rocket,
    buttonText: "Start Training",
    buttonIcon: Code,
    isLive: false,
    bgImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop", // Green code screen
    theme: {
      border: "border-emerald-500/20 hover:border-emerald-500/50",
      shadow: "hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.3)]",
      iconBg: "bg-[#0a1612] border-emerald-500/30",
      iconColor: "text-emerald-400",
      btnBg: "bg-[#059669] hover:bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      imageTint: "bg-emerald-500/20"
    }
  }
];

const ActionCardsGrid = () => {
  const navigate = useNavigate();

  const getModeRoute = (modeId) => {
    switch (modeId) {
      case '1v1':
        return '/battle';
      case 'weekly':
        return '/contests';
      case 'royale':
        return '/games';
      case 'practice':
        return '/practice';
      default:
        return '/home';
    }
  };

  const handleModeClick = (modeId) => {
    navigate(getModeRoute(modeId));
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 font-sans mt-8">
      {gameModes.map((mode) => {
        const Icon = mode.icon;
        const ButtonIcon = mode.buttonIcon;

        return (
          <div 
            key={mode.id}
            className={`relative flex flex-col justify-between p-5 md:p-6 rounded-2xl bg-[#0b0f19] border transition-all duration-300 overflow-hidden cursor-pointer group min-h-[260px] ${mode.theme.border} ${mode.theme.shadow}`}
            onClick={() => handleModeClick(mode.id)}
          >
            {/* 1. Base Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-700 group-hover:scale-110 z-0 grayscale" 
              style={{ backgroundImage: `url(${mode.bgImage})` }}
            ></div>
            
            {/* 2. Theme Color Tint Overlay */}
            <div className={`absolute inset-0 z-0 mix-blend-overlay ${mode.theme.imageTint}`}></div>

            {/* 3. Dark Fade Overlay (Solid dark at bottom, transparent at top) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/90 to-transparent z-0"></div>

            {/* Top Row: Icon & Optional Live Badge */}
            <div className="relative z-10 flex justify-between items-start mb-6">
              {/* Icon Box */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${mode.theme.iconBg}`}>
                <Icon size={18} className={mode.theme.iconColor} />
              </div>
              
              {/* Live Badge */}
              {mode.isLive && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black tracking-widest uppercase shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_#ef4444]"></span>
                  Live
                </div>
              )}
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex-1 flex flex-col justify-end">
              <h3 className="text-white font-bold text-xl mb-1.5 tracking-tight">
                {mode.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                {mode.description}
              </p>

              {/* Action Button */}
              <button 
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all duration-300 ${mode.theme.btnBg} group-hover:brightness-110 active:scale-[0.98]`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleModeClick(mode.id);
                }}
              >
                {mode.buttonText}
                <ButtonIcon size={16} />
              </button>
            </div>
            
          </div>
        );
      })}
    </div>
  );
};

export default ActionCardsGrid;