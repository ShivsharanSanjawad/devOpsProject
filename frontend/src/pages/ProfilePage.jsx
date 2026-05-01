import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Code2, Search, MapPin, Check, X, Clock, 
  Trophy, Flame, Zap, Users, 
  AlertTriangle, Loader2
} from 'lucide-react';

const baseURL = import.meta.env.VITE_BASE_URL;

// Helper to calculate "time ago" from ISO string
const timeAgo = (dateString) => {
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

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${baseURL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Helper to generate heatmap squares (static placeholder)
  const renderHeatmap = () => {
    const squares = [];
    for (let i = 0; i < 364; i++) {
      // Generate a deterministic pattern based on index
      const seed = (i * 7 + 13) % 100;
      let colorClass = 'bg-[#1a1f2e]'; // Empty
      if (seed > 90) colorClass = 'bg-emerald-400';
      else if (seed > 75) colorClass = 'bg-emerald-500';
      else if (seed > 55) colorClass = 'bg-emerald-800';
      else if (seed > 35) colorClass = 'bg-emerald-900/50';

      squares.push(<div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${colorClass}`}></div>);
    }
    return squares;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070a] text-cyan-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading Gladiator Profile...</p>
      </div>
    );
  }

  // Error State
  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl max-w-md text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3" />
          <p>{error || "Profile data not found"}</p>
        </div>
      </div>
    );
  }

  // --- SOLVED STATS CALCULATIONS ---
  const totalSolved = profileData.totalProblemsSolved || 0;
  
  // Estimated difficulty breakdown
  const easySolved = Math.floor(totalSolved * 0.4);
  const medSolved = Math.floor(totalSolved * 0.45);
  const hardSolved = totalSolved - easySolved - medSolved;

  const easyMax = 600;
  const medMax = 800;
  const hardMax = 400;
  const totalMax = easyMax + medMax + hardMax; // 1800

  // Calculate percentages for progress bars
  const easyPct = Math.min((easySolved / easyMax) * 100, 100);
  const medPct = Math.min((medSolved / medMax) * 100, 100);
  const hardPct = Math.min((hardSolved / hardMax) * 100, 100);

  // Calculate degrees for donut chart background
  const easyDeg = (easySolved / totalMax) * 360;
  const medDeg = (medSolved / totalMax) * 360;
  const hardDeg = (hardSolved / totalMax) * 360;

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans pb-20 relative overflow-hidden">
      
      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-0 w-[1000px] h-[1000px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none translate-x-1/3 translate-y-1/3 z-0"></div>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-8 relative z-10">
        
        {/* Profile Header */}
        <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden mb-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 to-purple-600"></div>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              {/* Uses profile image if available, else generates avatar based on username */}
              <img 
                src={profileData.profileImageUrl || `https://ui-avatars.com/api/?name=${profileData.username}&background=1a1f2e&color=38bdf8`} 
                alt="Profile" 
                className="w-20 h-20 rounded-xl object-cover border border-[#1a1f2e]" 
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#05070a] border border-[#1a1f2e] rounded-full px-2 py-0.5 flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white tracking-tight">{profileData.username}</h2>
                <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                  Coder
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 font-medium">
                <span>Rank: <span className="text-white font-bold">#{profileData.globalRank}</span></span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span>Rating: <span className="text-cyan-400 font-bold">{profileData.rating}</span></span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {profileData.college || "Earth"}</span>
              </div>
              {profileData.description && (
                <p className="text-xs text-slate-500 mt-1 italic">"{profileData.description}"</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
            <div className="hidden sm:flex items-center gap-2 bg-[#111624] border border-[#1a1f2e] rounded-xl px-4 py-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Streak</span>
              <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                <Flame size={16} className="text-orange-500 fill-orange-500/20" /> {profileData.streak} Days
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Global Rank</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-white">{profileData.globalRank}</p>
            </div>
          </div>
          <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rating</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-cyan-400">{profileData.rating}</p>
            </div>
          </div>
          <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Problems Solved</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-white">{profileData.totalProblemsSolved}</p>
            </div>
          </div>
          <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Submissions</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-purple-400">{profileData.totalSubmissions}</p>
            </div>
          </div>
          <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">College Rank</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-white">#{profileData.collegeRank}</p>
              <span className="text-[10px] text-slate-500 font-medium pb-1">of {profileData.totalUsersInCollege}</span>
            </div>
          </div>
          <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Contests</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-white">{profileData.contestsParticipated}</p>
            </div>
          </div>
        </div>

        {/* Layout Grid (Left 2/3, Right 1/3) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* ---- LEFT COLUMN ---- */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            
            {/* Recent Submissions */}
            <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Clock size={16} className="text-purple-400" /> RECENT SUBMISSIONS
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-[#1a1f2e]">
                    <tr>
                      <th className="pb-3 px-4 font-bold">Status</th>
                      <th className="pb-3 px-4 font-bold">Problem</th>
                      <th className="pb-3 px-4 font-bold text-center">Language</th>
                      <th className="pb-3 px-4 font-bold text-center">Time</th>
                      <th className="pb-3 px-4 font-bold text-right">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileData.recentSubmissions && profileData.recentSubmissions.length > 0 ? (
                      profileData.recentSubmissions.map((sub, index) => (
                        <tr key={sub.submissionId} className={`border-b border-[#1a1f2e]/50 hover:bg-[#111624] transition-colors ${index === profileData.recentSubmissions.length - 1 ? 'border-none' : ''}`}>
                          <td className="py-3.5 px-4 font-bold">
                            {sub.status === 'AC' && <span className="flex items-center gap-1.5 text-emerald-500"><Check size={14} /> AC</span>}
                            {sub.status === 'WA' && <span className="flex items-center gap-1.5 text-red-500"><X size={14} /> WA</span>}
                            {sub.status === 'TLE' && <span className="flex items-center gap-1.5 text-yellow-500"><Clock size={14} /> TLE</span>}
                            {sub.status === 'RE' && <span className="flex items-center gap-1.5 text-rose-500"><AlertTriangle size={14} /> RE</span>}
                            {sub.status === 'CE' && <span className="flex items-center gap-1.5 text-pink-500"><Code2 size={14} /> CE</span>}
                            {['AC', 'WA', 'TLE', 'RE', 'CE'].indexOf(sub.status) === -1 && <span className="flex items-center gap-1.5 text-slate-400"><Clock size={14} /> {sub.status}</span>}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-200 hover:text-cyan-400 cursor-pointer transition-colors">
                            {sub.problemTitle}
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-400 text-xs">{sub.language}</td>
                          <td className="py-3.5 px-4 text-center text-slate-300 font-mono text-xs">{sub.timeMs ?? 0} ms</td>
                          <td className="py-3.5 px-4 text-right text-slate-500 text-xs">{timeAgo(sub.submittedAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-500 text-sm">No recent submissions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Year (Heatmap) */}
            <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                  <Check size={16} className="text-emerald-400" /> Activity Year
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  Less 
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#1a1f2e]"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-900/50"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500"></div>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400"></div>
                  </div>
                  More
                </div>
              </div>
              <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
                  {renderHeatmap()}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">{profileData.totalSubmissions} contributions in the last year</p>
            </div>

          </div>

          {/* ---- RIGHT COLUMN ---- */}
          <div className="flex flex-col gap-6">
            
            {/* Dynamic Solved Stats */}
            <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                  <PieChartIcon className="text-purple-400" /> Solved
                </h3>
              </div>

              {/* Dynamic Donut Chart */}
              <div className="flex justify-center mb-8 relative">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000"
                  style={{
                    background: `conic-gradient(
                      #10b981 0deg ${easyDeg}deg, 
                      #f97316 ${easyDeg}deg ${easyDeg + medDeg}deg, 
                      #ef4444 ${easyDeg + medDeg}deg ${easyDeg + medDeg + hardDeg}deg, 
                      #1a1f2e ${easyDeg + medDeg + hardDeg}deg 360deg
                    )`
                  }}
                >
                  <div className="w-28 h-28 bg-[#0b0f19] rounded-full flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{totalSolved}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Solved</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Progress Bars */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-emerald-500">Easy</span>
                    <span className="text-slate-400"><span className="text-emerald-500">{easySolved}</span> / {easyMax}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1a1f2e] rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-emerald-500 rounded-full transition-all duration-1000 ${easyPct > 0 ? 'shadow-[0_0_8px_#10b981]' : ''}`}
                      style={{ width: `${easyPct}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-orange-500">Medium</span>
                    <span className="text-slate-400"><span className="text-orange-500">{medSolved}</span> / {medMax}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1a1f2e] rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-orange-500 rounded-full transition-all duration-1000 ${medPct > 0 ? 'shadow-[0_0_8px_#f97316]' : ''}`}
                      style={{ width: `${medPct}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-red-500">Hard</span>
                    <span className="text-slate-400"><span className="text-red-500">{hardSolved}</span> / {hardMax}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1a1f2e] rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-red-500 rounded-full transition-all duration-1000 ${hardPct > 0 ? 'shadow-[0_0_8px_#ef4444]' : ''}`}
                      style={{ width: `${hardPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0b0f19; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1f2e; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2a3143; }
      `}} />
    </div>
  );
};

// Simple PieChart Icon Component
const PieChartIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

export default ProfilePage;