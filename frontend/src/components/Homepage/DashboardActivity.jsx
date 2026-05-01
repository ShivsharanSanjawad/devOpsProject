import React, { useState, useEffect } from 'react';
import { Activity, Code, Crown, Trophy, GitCommit, CheckCircle2, XCircle, AlertTriangle, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper to calculate "time ago" from ISO string
const timeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

// Helper to style the status text and icon
const getStatusInfo = (status) => {
  switch(status) {
    case 'AC': return { text: 'solved', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <CheckCircle2 size={12} className="text-emerald-500" /> };
    case 'WA': return { text: 'failed', color: 'text-red-500', bg: 'bg-red-500/10', icon: <XCircle size={12} className="text-red-500" /> };
    case 'RE': return { text: 'crashed on', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: <AlertTriangle size={12} className="text-rose-500" /> };
    case 'TLE': return { text: 'timed out on', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: <Clock size={12} className="text-yellow-500" /> };
    default: return { text: 'attempted', color: 'text-slate-400', bg: 'bg-slate-500/10', icon: <Code size={12} className="text-slate-400" /> };
  }
};

const DashboardActivity = ({ recentSubmissions = [], contests = [] }) => {
  // Timer state for the featured contest
  const [timeLeft, setTimeLeft] = useState({ hours: '00', mins: '00', secs: '00' });
  
  // Clean up submissions feed
  const displaySubmissions = recentSubmissions.slice(0, 4);

  // Filter and sort contests
  const activeContests = contests.filter(c => c.status === 'ONGOING' || c.status === 'UPCOMING');
  
  // Find a featured contest (Prefer ONGOING, fallback to closest UPCOMING)
  const featuredContest = activeContests.find(c => c.status === 'ONGOING') 
    || activeContests.find(c => c.status === 'UPCOMING');
    
  // The rest of the active contests for the list
  const secondaryContests = activeContests.filter(c => c.id !== featuredContest?.id).slice(0, 2);

  // Live Timer Effect for Featured Contest
  useEffect(() => {
    if (!featuredContest) return;

    const targetDate = new Date(featuredContest.status === 'ONGOING' ? featuredContest.endTime : featuredContest.startTime).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ hours: '00', mins: '00', secs: '00' });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: hours.toString().padStart(2, '0'),
        mins: minutes.toString().padStart(2, '0'),
        secs: seconds.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [featuredContest]);


  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans mt-8">
      
      {/* LEFT COLUMN: Live in the Arena */}
      <div className="lg:col-span-2 bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-5 md:p-6 flex flex-col hover:border-[#2a3143] transition-colors duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
            <h2 className="text-white font-bold text-lg">Live in the Arena</h2>
          </div>
          <Link to="/contests" className="text-cyan-500 hover:text-cyan-300 text-sm font-medium transition-all duration-300 hover:translate-x-1 inline-block">
            View All Events &rarr;
          </Link>
        </div>

        {activeContests.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 border border-dashed border-[#1a1f2e] rounded-xl bg-[#111624]">
            <Trophy className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No active contests right now.</p>
            <p className="text-slate-500 text-xs mt-1">Check back later for new challenges!</p>
          </div>
        ) : (
          <>
            {/* Featured Live Event Card */}
            {featuredContest && (
              <div className="w-full bg-gradient-to-r from-[#17112c] to-[#0d121c] border border-purple-500/20 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgba(168,85,247,0.3)] hover:border-purple-500/40 transition-all duration-300 cursor-pointer">
                
                <div className="absolute top-0 left-10 w-40 h-40 bg-purple-600/10 group-hover:bg-purple-600/20 blur-3xl pointer-events-none rounded-full transition-colors duration-500"></div>

                <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                  
                  {/* Dynamic Timer Ring */}
                  <div className={`w-[72px] h-[72px] rounded-full border-4 border-[#241b3d] flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 ${featuredContest.status === 'ONGOING' ? 'border-t-emerald-500 border-l-emerald-500' : 'border-t-purple-500 border-l-purple-500'}`}>
                    <span className="text-white font-black text-sm tracking-tight">
                      {timeLeft.hours !== '00' ? `${timeLeft.hours}:${timeLeft.mins}` : `${timeLeft.mins}:${timeLeft.secs}`}
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${featuredContest.status === 'ONGOING' ? 'text-emerald-400' : 'text-purple-400'}`}>
                      {featuredContest.status === 'ONGOING' ? 'Ends In' : 'Starts In'}
                    </span>
                  </div>

                  {/* Event Info */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider border ${featuredContest.status === 'ONGOING' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-purple-500/20 text-purple-400 border-purple-500/20'}`}>
                        {featuredContest.status}
                      </span>
                      <span className="text-slate-400 text-xs font-medium group-hover:text-slate-300 transition-colors">
                        {featuredContest.problemCount} Problems
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-purple-100 transition-colors truncate max-w-[250px] md:max-w-md">
                      {featuredContest.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3 truncate max-w-[250px] md:max-w-md">
                      {featuredContest.description || "Join the arena and compete against the best!"}
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Users size={14} className="text-slate-400" />
                        <span>{featuredContest.participantCount} Registered</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link to={`/contest-arena`} className="w-full md:w-auto bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-lg font-bold text-sm text-center transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 relative z-10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  {featuredContest.status === 'ONGOING' ? 'Enter Arena' : 'Register Now'}
                </Link>
              </div>
            )}

            {/* Secondary Events List */}
            {secondaryContests.length > 0 && (
              <div className="flex flex-col gap-3 mt-4">
                {secondaryContests.map(contest => (
                  <div key={contest.id} className="group bg-[#111624] border border-[#1a1f2e] hover:border-[#2a3143] rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-black/20 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 ${contest.status === 'ONGOING' ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' : 'bg-blue-500/10 group-hover:bg-blue-500/20'}`}>
                        {contest.status === 'ONGOING' ? <Crown size={18} className="text-emerald-500" /> : <Code size={18} className="text-blue-500" />}
                      </div>
                      <div>
                        <h4 className={`text-white font-bold text-sm mb-0.5 transition-colors ${contest.status === 'ONGOING' ? 'group-hover:text-emerald-100' : 'group-hover:text-blue-100'}`}>
                          {contest.title}
                        </h4>
                        <p className="text-slate-400 text-xs">
                          {contest.status === 'ONGOING' ? 'Live Now' : timeAgo(contest.startTime)} • {contest.participantCount} Players
                        </p>
                      </div>
                    </div>
                    <Link to="/contest-arena" className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 active:scale-95 ${contest.status === 'ONGOING' ? 'bg-[#1e2536] group-hover:bg-emerald-500 group-hover:text-black text-white' : 'bg-[#1a2035] group-hover:bg-blue-600 group-hover:text-white text-blue-400'}`}>
                      {contest.status === 'ONGOING' ? 'Spectate' : 'Register'}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>


      {/* RIGHT COLUMN: Recent Activity */}
      <div className="lg:col-span-1 bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-5 md:p-6 flex flex-col hover:border-[#2a3143] transition-colors duration-500">
        
        <div className="flex items-center gap-2 mb-6 group cursor-pointer">
          <Activity size={18} className="text-cyan-500 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
          <h2 className="text-white font-bold text-lg">Your Recent Activity</h2>
        </div>

        <div className="relative border-l border-[#1a1f2e] ml-3 mt-2 flex-1 space-y-7 pb-4">
          
          {displaySubmissions.length > 0 ? (
            displaySubmissions.map((sub) => {
              const statusInfo = getStatusInfo(sub.status);
              
              return (
                <div key={sub.submissionId} className="relative pl-5 group cursor-pointer">
                  <div className={`absolute -left-[14px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-4 border-[#0b0f19] group-hover:scale-110 transition-all duration-300 ${statusInfo.bg}`}>
                    {statusInfo.icon}
                  </div>
                  
                  <div className="transition-all duration-300 group-hover:translate-x-1">
                    <p className="text-sm text-slate-300 leading-snug group-hover:text-white transition-colors truncate max-w-[200px]">
                      You <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span> <span className="text-white font-bold group-hover:text-cyan-400 transition-colors">{sub.problemTitle}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500 group-hover:text-slate-400">{timeAgo(sub.submittedAt)}</p>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <p className="text-[10px] text-slate-500 font-mono">{sub.language}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <Code size={32} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">No recent activity yet.</p>
              <p className="text-slate-500 text-xs mt-1">Head to the Arena to start solving!</p>
            </div>
          )}

        </div>

        <Link to="/profile" className="w-full text-center mt-4 bg-[#111724] hover:bg-[#1a2133] border border-[#1a1f2e] text-slate-300 hover:text-white py-3 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95">
          View Submission History
        </Link>

      </div>
    </div>
  );
};

export default DashboardActivity;