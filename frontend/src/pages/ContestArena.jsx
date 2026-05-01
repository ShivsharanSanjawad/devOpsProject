import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Code2, Clock, LogOut, List, Trophy, Filter, 
  Users, CheckCircle2, Hourglass, Circle, HelpCircle, 
  ArrowUp, ChevronRight, Loader2, AlertTriangle
} from 'lucide-react';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api';

const ContestArena = () => {
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contestId');
  const navigate = useNavigate();

  const [contestData, setContestData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaderboardError, setLeaderboardError] = useState(''); // Track leaderboard errors
  const leaderboardPollingRef = useRef(null); // Track polling interval
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: '00', mins: '00', secs: '00' });

  // Manual refresh function for leaderboard
  const refreshLeaderboard = useCallback(async () => {
    if (!contestId) return;
    
    const token = localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    try {
      const res = await axios.get(`${baseURL}/contests/${contestId}/leaderboard`, { headers });
      console.log("🔄 Manual leaderboard refresh - Response:", res.data);
      
      if (res.data?.entries && Array.isArray(res.data.entries)) {
        console.log("📊 Updated with", res.data.entries.length, "entries");
        setLeaderboardData(res.data.entries);
        setLeaderboardError('');
      } else if (Array.isArray(res.data)) {
        console.log("📊 Updated with", res.data.length, "entries (array format)");
        setLeaderboardData(res.data);
        setLeaderboardError('');
      }
    } catch (err) {
      console.error("❌ Manual refresh failed:", err.message);
    }
  }, [contestId]);

  // 1. Fetch Contest Details, Leaderboard, and My Submissions concurrently
  useEffect(() => {
    const fetchArenaData = async () => {
      if (!contestId) {
        setError("No contest ID provided.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        console.log("Fetching contest data for contestId:", contestId);

        // Fetch contest data (required)
        const contestRes = await axios.get(`${baseURL}/contests/${contestId}`, { headers });
        console.log("Contest data received:", contestRes.data);

                // Fetch leaderboard (with error handling)
        let leaderboardData = [];
        try {
          const leaderboardRes = await axios.get(`${baseURL}/contests/${contestId}/leaderboard`, { headers });
          console.log("✅ Initial leaderboard fetch - Response:", leaderboardRes.data);
          
          if (leaderboardRes.data?.entries && Array.isArray(leaderboardRes.data.entries)) {
            console.log("📊 Got", leaderboardRes.data.entries.length, "leaderboard entries");
            leaderboardData = leaderboardRes.data.entries;
          } else if (Array.isArray(leaderboardRes.data)) {
            console.log("📊 Got", leaderboardRes.data.length, "leaderboard entries (direct array)");
            leaderboardData = leaderboardRes.data;
          } else {
            console.warn("⚠️ Unexpected leaderboard format:", leaderboardRes.data);
            leaderboardData = [];
          }
        } catch (leaderboardErr) {
          console.error("❌ Initial leaderboard fetch error:", leaderboardErr.message);
          if (leaderboardErr.response) {
            console.error("❌ Status:", leaderboardErr.response.status, "Data:", leaderboardErr.response.data);
            setLeaderboardError(`Failed to load: ${leaderboardErr.response.status}`);
          } else {
            setLeaderboardError(leaderboardErr.message);
          }
          leaderboardData = [];
        }

        // Fetch my submissions (with error handling)
        let mySubmissionsData = [];
        try {
          const mySubsRes = await axios.get(`${baseURL}/contests/${contestId}/my-submissions`, { headers });
          console.log("My submissions received:", mySubsRes.data);
          mySubmissionsData = Array.isArray(mySubsRes.data) ? mySubsRes.data : [];
        } catch (submissionsErr) {
          console.warn("My submissions fetch error:", submissionsErr.message);
          mySubmissionsData = [];
        }

        setContestData(contestRes.data);
        setLeaderboardData(leaderboardData);
        setMySubmissions(mySubmissionsData);

      } catch (err) {
        console.error("Failed to load contest arena data:", err);
        console.error("Error response:", err.response?.data);
        setError(err.response?.data?.message || "Failed to load contest data. You may not be registered.");

      } finally {
        setIsLoading(false);
      }
    };

    fetchArenaData();
  }, [contestId]);

  // 3. Real-time Leaderboard Polling (updates every 1.5 seconds for live rankings)
  useEffect(() => {
    if (!contestId) return;
    
    // Immediately fetch leaderboard when component mounts
    refreshLeaderboard();
    
    // Set up polling interval - update every 1.5 seconds
    leaderboardPollingRef.current = setInterval(() => {
      refreshLeaderboard();
    }, 1500);

    // Listen for page visibility to refresh when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("📂 Page is now visible - refreshing leaderboard");
        refreshLeaderboard();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (leaderboardPollingRef.current) {
        clearInterval(leaderboardPollingRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [contestId, refreshLeaderboard]);

  // 4. Real-time My Submissions Polling (updates every 2 seconds for solved count)
  useEffect(() => {
    if (!contestId) return;
    
    const token = localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    // Poll my submissions every 2 seconds for live problem status
    const submissionsInterval = setInterval(async () => {
      try {
        const res = await axios.get(`${baseURL}/contests/${contestId}/my-submissions`, { headers }).catch(() => ({ data: [] }));
        setMySubmissions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.warn("Submissions polling error:", err.message);
      }
    }, 2000);

    return () => clearInterval(submissionsInterval);
  }, [contestId]);

  // 2. Live Timer Countdown
  useEffect(() => {
    if (!contestData?.endTime) return;

    const targetDate = new Date(contestData.endTime).getTime();

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
  }, [contestData]);


  // Helper Functions
  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'text-slate-400';
    const diff = difficulty.toUpperCase();
    if (diff.includes('EASY')) return 'text-emerald-400';
    if (diff.includes('MEDIUM')) return 'text-yellow-400';
    if (diff.includes('HARD')) return 'text-orange-500';
    if (diff.includes('EXTREME') || diff.includes('VERY')) return 'text-red-500';
    return 'text-slate-400';
  };

  const getLetterBoxStyle = (status, active) => {
    if (active) return 'bg-blue-600/20 text-blue-400 border border-blue-500/50';
    if (status === 'SOLVED' || status === 'AC') return 'bg-[#111624] text-emerald-500 border border-[#1a1f2e]';
    return 'bg-[#111624] text-slate-400 border border-[#1a1f2e]';
  };

  const navigateToProblem = (problemId) => {
    navigate(`/problem/${problemId}?contestId=${contestId}`);
  };

  // Compute User Performance Metrics from `mySubmissions`
  const uniqueProblemsSolved = new Set(
    mySubmissions.filter(s => s.status === 'AC').map(s => s.problemId)
  ).size;
  const totalSubmissions = mySubmissions.length;
  const accuracy = totalSubmissions > 0 ? Math.round((uniqueProblemsSolved / totalSubmissions) * 100) : 0;

  // Find user's rank and score from the leaderboard
  const currentUserRankData = leaderboardData.find(entry => entry.username === localStorage.getItem('username')) || { rank: 'N/A', totalPoints: 0, totalPenalty: 0 };


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070a] text-cyan-400 font-sans">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-slate-400 font-medium tracking-wide">Connecting to Arena...</p>
      </div>
    );
  }

  if (error || !contestData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a] font-sans">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-5 rounded-xl max-w-md text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Access Denied</h3>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => navigate('/contests')}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-bold transition-colors"
          >
            Back to Contests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans pb-20 selection:bg-blue-500/30">
      
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-8">
        
        {/* --- CONTEST HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <span className={`border text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1.5 uppercase tracking-widest ${contestData.status === 'ONGOING' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
                {contestData.status === 'ONGOING' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>} 
                {contestData.status}
              </span>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Ranked Match
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
              {contestData.title}
            </h1>
            <p className="text-slate-400 text-sm">
              {contestData.description || 'Welcome to the coding arena.'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                {contestData.status === 'UPCOMING' ? 'Starts In' : 'Ends In'}
              </span>
              <div className="flex items-center gap-2 text-3xl font-mono font-black text-white">
                <div className="bg-[#111624] border border-[#1a1f2e] rounded-lg px-3 py-1.5 shadow-inner">{timeLeft.hours}</div>
                <span className="text-slate-500 pb-1">:</span>
                <div className="bg-[#111624] border border-[#1a1f2e] rounded-lg px-3 py-1.5 shadow-inner">{timeLeft.mins}</div>
                <span className="text-slate-500 pb-1">:</span>
                <div className={`bg-[#111624] border border-[#1a1f2e] rounded-lg px-3 py-1.5 shadow-inner ${contestData.status === 'ONGOING' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-slate-400'}`}>
                  {timeLeft.secs}
                </div>
              </div>
            </div>
            
            <div className="h-12 w-[1px] bg-[#1a1f2e] hidden md:block"></div>
            
            <button 
              onClick={() => navigate('/contests')}
              className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
            >
              Exit Arena <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Problems & Performance */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            
            {/* PROBLEMS LIST */}
            <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <List size={20} className="text-blue-400" /> Problems
                </h2>
                <span className="text-xs text-slate-500 font-semibold">{contestData.problems?.length || 0} Problems</span>
              </div>

              <div className="flex flex-col gap-3">
                {contestData?.problems && contestData.problems.length > 0 ? (
                  contestData.problems.map((problem, index) => {
                    const letter = String.fromCharCode(65 + index); // A, B, C...
                    
                    // Safely get problemId (handle both direct id and problemId fields)
                    const problemId = problem.problemId || problem.id;
                    
                    if (!problemId) {
                      console.warn("Problem missing ID:", problem);
                      return null;
                    }
                    
                    // Determine if the user solved this specific problem based on mySubmissions
                    const problemStatus = mySubmissions.some(sub => sub.problemId === problemId && sub.status === 'AC') 
                      ? 'SOLVED' 
                      : mySubmissions.some(sub => sub.problemId === problemId) 
                        ? 'ATTEMPTED' 
                        : 'UNATTEMPTED';

                    return (
                      <div 
                        key={problemId} 
                        onClick={() => navigateToProblem(problemId)}
                        className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer border bg-[#05070a] border-[#1a1f2e] hover:border-[#2a3143]`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black shrink-0 ${getLetterBoxStyle(problemStatus, false)}`}>
                            {letter}
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <h3 className={`font-bold text-slate-200 text-base leading-tight hover:text-blue-400 transition-colors`}>
                              {problem.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`font-bold ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty} • {problem.points} Pts
                              </span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-500">{(problem.timeLimitMs || 1000) / 1000}s / {problem.memoryLimitMb || 256} MB</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="w-6 flex justify-center shrink-0">
                            {problemStatus === 'SOLVED' ? (
                              <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 size={18} className="text-emerald-500" /></div>
                            ) : problemStatus === 'ATTEMPTED' ? (
                              <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center"><Hourglass size={16} className="text-yellow-500" /></div>
                            ) : (
                              <Circle size={18} className="text-slate-700" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    {contestData?.problems === undefined ? 'Loading problems...' : 'No problems assigned to this contest yet.'}
                  </div>
                )}
              </div>
            </div>

            {/* YOUR PERFORMANCE */}
            <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-purple-500"></span></span>
                Your Performance
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#05070a] border border-[#1a1f2e] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Solved</span>
                  <div className="text-2xl font-black text-white mb-2">{uniqueProblemsSolved}<span className="text-slate-500 text-lg">/{contestData.problems?.length || 0}</span></div>
                  <div className="w-full h-1.5 bg-[#1a1f2e] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all" 
                      style={{ width: `${(uniqueProblemsSolved / (contestData.problems?.length || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-[#05070a] border border-[#1a1f2e] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Rank</span>
                  <span className="text-3xl font-black text-white">{currentUserRankData.rank}</span>
                </div>

                <div className="bg-[#05070a] border border-[#1a1f2e] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Score</span>
                  <span className="text-3xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">{currentUserRankData.totalPoints}</span>
                </div>

                <div className="bg-[#05070a] border border-[#1a1f2e] rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Submissions</span>
                  <span className="text-2xl font-black text-white">{totalSubmissions}</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Leaderboard */}
          <div className="xl:col-span-1">
            <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-500" /> Leaderboard
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-white bg-[#111624] rounded-lg transition-colors"><Filter size={16} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-white bg-[#111624] rounded-lg transition-colors"><Users size={16} /></button>
                </div>
              </div>

              {/* Debug: Show error if leaderboard polling failed */}
              {leaderboardError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3 py-2 rounded-lg mb-4">
                  <p className="font-semibold">Leaderboard Error</p>
                  <p className="text-[11px] mt-1">{leaderboardError}</p>
                </div>
              )}

              {leaderboardData.length > 0 ? (
                <>
                  <div className="grid grid-cols-[30px_1fr_60px] gap-2 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
                    <div className="text-center">#</div>
                    <div>User</div>
                    <div className="text-right">Score</div>
                  </div>

                  <div className="flex flex-col gap-1 mb-4 flex-1 overflow-y-auto custom-scrollbar">
                    {leaderboardData.slice(0, 50).map((item, index) => {
                      const isCurrentUser = item.username === localStorage.getItem('username');
                      return (
                        <div 
                          key={item.userId} 
                          className={`grid grid-cols-[30px_1fr_60px] gap-2 items-center p-2 rounded-lg transition-colors cursor-default ${isCurrentUser ? 'bg-blue-600/10 border border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'hover:bg-[#111624]'}`}
                        >
                          <div className={`text-center font-bold text-sm ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-500' : isCurrentUser ? 'text-blue-400' : 'text-slate-500'}`}>
                            {item.rank || index + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black shrink-0 ${index === 0 ? 'bg-yellow-500/10 text-yellow-500' : isCurrentUser ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/10 text-slate-300'}`}>
                              {(item.username || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className={`${isCurrentUser ? 'text-white font-bold' : 'text-slate-200 font-semibold'} text-sm truncate`}>
                              {item.username}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-white font-bold text-sm leading-tight">{item.totalPoints || 0}</span>
                            <span className="text-slate-500 text-[9px] leading-tight">{item.totalPenalty || 0}m</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-10">
                  <Trophy size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">Leaderboard is empty.</p>
                  <p className="text-xs">Be the first to solve a problem!</p>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1f2e; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2a3143; }
      `}} />

    </div>
  );
};

export default ContestArena;