import React from 'react';
import { Check, BarChart2, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArenaChallengeAndProgress = ({ dailyQuestion }) => {
  const navigate = useNavigate();

  const challengeTitle = dailyQuestion?.title || 'Today\'s Challenge';
  const challengeDifficulty = String(dailyQuestion?.difficulty || 'MEDIUM').toLowerCase();
  const challengeAcceptance = dailyQuestion?.acceptanceRate != null ? `${dailyQuestion.acceptanceRate}%` : 'N/A';
  const challengePoints = dailyQuestion?.points != null ? `+${dailyQuestion.points}` : '+50';
  const challengeDescription = dailyQuestion?.description
    || dailyQuestion?.body
    || 'Solve this featured problem to improve your consistency and strengthen fundamentals.';
  const challengeTags = Array.isArray(dailyQuestion?.topics) && dailyQuestion.topics.length > 0
    ? dailyQuestion.topics.slice(0, 2)
    : ['Math', 'Basics'];

  const difficultyBadgeClass =
    challengeDifficulty === 'easy'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      : challengeDifficulty === 'hard'
        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        : 'bg-orange-500/10 border-orange-500/20 text-orange-400';

  const onSolveChallenge = () => {
    if (!dailyQuestion?.id) return;
    navigate(`/problem/${dailyQuestion.id}`);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans mt-8">
      
      {/* LEFT COLUMN: Today's Arena Challenge (Takes up 2 columns on large screens) */}
      <div className="lg:col-span-2 bg-[#0b0f19] border border-[#1a1f2e] hover:border-[#2a3143] transition-colors duration-500 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-stretch group">
        
        {/* Left Side: Challenge Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-white font-bold text-lg">Today's Arena Challenge</h2>
              <span className={`border text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${difficultyBadgeClass}`}>
                {challengeDifficulty}
              </span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
              {challengeTitle}
            </h3>
            
            <p className="text-slate-400 text-sm leading-relaxed pr-0 md:pr-4 mb-6">
              {challengeDescription}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1">Acceptance</p>
                <p className="text-white font-bold text-lg">{challengeAcceptance}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1">Points</p>
                <p className="text-white font-bold text-lg">{challengePoints} <span className="text-sm text-slate-400 font-medium">XP</span></p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium mb-1">Tags</p>
                <div className="flex items-center gap-2 mt-1">
                  {challengeTags.map((tag) => (
                    <span key={tag} className="bg-[#1e2536] text-slate-300 text-[11px] font-medium px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4">
            <button
              onClick={onSolveChallenge}
              disabled={!dailyQuestion?.id}
              className="bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-95 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Solve Challenge
            </button>
            <p className="text-slate-500 text-xs italic">
              Curated based on your recent activity in Graph Theory.
            </p>
          </div>
        </div>

        {/* Right Side: Code Snippet */}
        <div className="w-full md:w-[280px] lg:w-[320px] bg-[#05070a] border border-[#1a1f2e] rounded-xl relative overflow-hidden flex flex-col shrink-0 group-hover:border-[#2a3143] transition-colors">
          {/* Top Gradient Border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500"></div>
          
          <div className="p-5 font-mono text-[13px] leading-relaxed overflow-x-auto">
            <div className="text-slate-500 mb-2">// Starter Code (C++)</div>
            <div className="flex">
              <span className="text-pink-500 mr-2">class</span>
              <span className="text-yellow-300">Solution</span>
              <span className="text-slate-300 ml-2">{'{'}</span>
            </div>
            <div className="pl-4 text-pink-500">public:</div>
            <div className="pl-8 flex gap-2">
              <span className="text-cyan-400">int</span>
              <span className="text-blue-300">maxFlow</span><span className="text-slate-300">(<span className="text-cyan-400">int</span> n,</span>
            </div>
            <div className="pl-12 flex gap-2">
              <span className="text-cyan-400">vector</span><span className="text-slate-300">&lt;<span className="text-cyan-400">vector</span>&lt;<span className="text-cyan-400">int</span>&gt;&gt;&amp; edges) {'{'}</span>
            </div>
            <div className="pl-16 text-slate-500">// Your code here</div>
            <div className="pl-16 flex gap-2">
              <span className="text-pink-500">return</span>
              <span className="text-orange-300">0</span><span className="text-slate-300">;</span>
            </div>
            <div className="pl-8 text-slate-300">{'}'}</div>
            <div className="text-slate-300">{'};'}</div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Quick Links */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        <div>
          <h2 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-4">Quick Links</h2>
          
          <div className="flex flex-col gap-3">
            
            <div 
              onClick={() => navigate('/practice')}
              className="bg-[#0b0f19] border border-[#1a1f2e] hover:border-[#2a3143] rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Check size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Practice Problems</p>
                  <p className="text-slate-500 text-xs">Sharpen your skills</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => navigate('/contests')}
              className="bg-[#0b0f19] border border-[#1a1f2e] hover:border-[#2a3143] rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <BarChart2 size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Contests</p>
                  <p className="text-slate-500 text-xs">Compete with others</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => navigate('/profile')}
              className="bg-[#0b0f19] border border-[#1a1f2e] hover:border-[#2a3143] rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Target size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Your Profile</p>
                  <p className="text-slate-500 text-xs">View stats & submissions</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ArenaChallengeAndProgress;