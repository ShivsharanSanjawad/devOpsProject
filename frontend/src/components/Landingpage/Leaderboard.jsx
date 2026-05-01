import React from 'react';
import { Flame } from 'lucide-react';

const leaderboardData = [
  {
    rank: 1,
    name: "CyberNinja_99",
    tier: "Grandmaster",
    rating: 3245,
    winRate: "82%",
    streak: 14,
    status: "In Match",
    avatar: "https://i.pravatar.cc/150?u=1"
  },
  {
    rank: 2,
    name: "AlgoQueen",
    tier: "Master",
    rating: 3192,
    winRate: "78%",
    streak: 3,
    status: "Online",
    avatar: "https://i.pravatar.cc/150?u=2"
  },
  {
    rank: 3,
    name: "NullPointer",
    tier: "Master",
    rating: 3089,
    winRate: "75%",
    streak: 8,
    status: "Offline",
    avatar: "https://i.pravatar.cc/150?u=3"
  },
  {
    rank: 4,
    name: "BinaryBeast",
    tier: "Diamond",
    rating: 2958,
    winRate: "65%",
    streak: 0,
    status: "In Match",
    avatar: "https://i.pravatar.cc/150?u=4"
  },
  {
    rank: 5,
    name: "StackOverflowed",
    tier: "Diamond",
    rating: 2915,
    winRate: "62%",
    streak: 2,
    status: "Online",
    avatar: "https://i.pravatar.cc/150?u=5"
  }
];

const renderRankBadge = (rank) => {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30">
        1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-300 bg-slate-300/10 border border-slate-300/30">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-orange-400 bg-orange-400/10 border border-orange-400/30">
        3
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-slate-500">
      {rank}
    </div>
  );
};

const renderStatusBadge = (status) => {
  switch (status) {
    case 'In Match':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          In Match
        </span>
      );
    case 'Online':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-400/10 border border-blue-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          Online
        </span>
      );
    case 'Offline':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-slate-400 bg-slate-400/10 border border-slate-600/30">
          Offline
        </span>
      );
    default:
      return null;
  }
};

const Leaderboard = () => {
  return (
    <section id="leaderboard" className="bg-[#05070a] min-h-screen flex items-center justify-center p-6 font-sans">
      <div className="max-w-5xl w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-1 font-display">
              GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">RANKING</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Top gladiators of the current season.
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#0b0f19] rounded-2xl border border-[#1a1f2e] overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-[60px_1fr_100px_100px_80px_120px] gap-4 px-6 py-4 border-b border-[#1a1f2e] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="text-center">RANK</div>
            <div>GLADIATOR</div>
            <div className="text-center">RATING</div>
            <div className="text-center">WIN RATE</div>
            <div className="text-center">STREAK</div>
            <div className="text-center">STATUS</div>
          </div>

          {/* Table Rows */}
          <div className="flex flex-col">
            {leaderboardData.map((user, index) => (
              <div 
                key={user.rank} 
                className="grid grid-cols-[60px_1fr_100px_100px_80px_120px] gap-4 px-6 py-4 items-center border-b border-[#1a1f2e] last:border-b-0 hover:bg-[#0d121c] transition-colors"
              >
                {/* Rank */}
                <div className="flex justify-center">
                  {renderRankBadge(user.rank)}
                </div>

                {/* Gladiator Info */}
                <div className="flex items-center gap-3">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full border border-slate-700"
                  />
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-sm">
                      {user.name}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {user.tier}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="text-center font-bold text-yellow-500 text-sm">
                  {user.rating}
                </div>

                {/* Win Rate */}
                <div className="text-center text-slate-300 font-medium text-sm">
                  {user.winRate}
                </div>

                {/* Streak */}
                <div className="flex items-center justify-center gap-1 font-bold text-orange-500 text-sm">
                  <Flame size={16} className="text-orange-500 fill-orange-500/20" />
                  {user.streak > 0 ? user.streak : '-'}
                </div>

                {/* Status */}
                <div className="flex justify-center">
                  {renderStatusBadge(user.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Leaderboard;