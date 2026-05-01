import React, { useState, useEffect } from 'react';
import { 
  Search, Shuffle, CheckCircle2, Flame, 
  Wrench, Circle, ChevronDown, PieChart, 
  Bot, Timer, X, Filter, Loader2
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api';
// --- SUB-COMPONENTS ---

const PracticeHeader = ({ streakDays, solvedTodayCount }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
    <div>
      <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 font-display">
        Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Problems</span>
      </h1>
      <p className="text-slate-400 text-sm">
        Sharpen your skills. Level up your game. Enter the arena.
      </p>
    </div>

    {/* Header Stats */}
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
      <div className="flex items-center gap-3">
        {/* Solved Stat */}
        <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1a1f2e] rounded-xl p-3 px-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Solved Today</span>
            <span className="text-white font-bold text-sm leading-none">{solvedTodayCount} <span className="text-slate-500 font-medium text-xs">/ 5 goal</span></span>
          </div>
        </div>
        
        {/* Streak Stat */}
        <div className="flex items-center gap-3 bg-[#0b0f19] border border-[#1a1f2e] rounded-xl p-3 px-4">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
            <Flame size={16} className="text-yellow-500 fill-yellow-500/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Streak</span>
            <span className="text-white font-bold text-sm leading-none">{streakDays} <span className="text-slate-500 font-medium text-xs">days</span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SearchAndFilters = ({ 
  searchQuery, setSearchQuery, 
  difficultyFilter, toggleDifficulty, 
  statusFilter, toggleStatus, 
  clearFilters, onRandomClick 
}) => (
  <div className="flex flex-col gap-4 mb-6">
    {/* Search Bar */}
    <div className="flex items-center gap-3 w-full bg-[#0b0f19] border border-[#1a1f2e] rounded-xl p-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
      <Search size={18} className="text-slate-500 ml-3 shrink-0" />
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for problems by title, tag, or ID..." 
        className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-slate-600 px-2"
      />
      <button 
        onClick={onRandomClick}
        className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white bg-[#111724] px-4 py-2 rounded-lg text-xs font-bold transition-colors"
      >
        <Shuffle size={14} /> Random
      </button>
      <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
        Search
      </button>
    </div>

    {/* Filter Row */}
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1a1f2e] pb-4">
      <div className="flex flex-wrap items-center gap-6">
        
        {/* Difficulty Filters */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-2">
            <Filter size={12} /> Difficulty:
          </span>
          <button 
            onClick={() => toggleDifficulty('EASY')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${difficultyFilter === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'border-transparent text-slate-400 hover:text-white'}`}
          >Easy</button>
          <button 
            onClick={() => toggleDifficulty('MEDIUM')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${difficultyFilter === 'MEDIUM' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'border-transparent text-slate-400 hover:text-white'}`}
          >Medium</button>
          <button 
            onClick={() => toggleDifficulty('HARD')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${difficultyFilter === 'HARD' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'border-transparent text-slate-400 hover:text-white'}`}
          >Hard</button>
        </div>

        <div className="w-[1px] h-4 bg-[#1a1f2e] hidden md:block"></div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-2">Status:</span>
          <button 
            onClick={() => toggleStatus('todo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${statusFilter === 'todo' ? 'bg-slate-500/20 text-white border-slate-500/30' : 'border-[#1a1f2e] text-slate-400 hover:text-white'}`}
          >
            <Circle size={10} /> Todo
          </button>
          <button 
            onClick={() => toggleStatus('solved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${statusFilter === 'solved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'border-[#1a1f2e] text-slate-400 hover:text-white'}`}
          >
            <CheckCircle2 size={12} /> Solved
          </button>
          <button 
            onClick={() => toggleStatus('attempted')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${statusFilter === 'attempted' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'border-[#1a1f2e] text-slate-400 hover:text-white'}`}
          >
            <Wrench size={10} /> Attempted
          </button>
        </div>
      </div>

      {/* Dropdowns (Static for now) */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 text-slate-400 hover:text-white border border-[#1a1f2e] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
          Tags <ChevronDown size={14} />
        </button>
      </div>
    </div>

    {/* Active Filters Row */}
    {(difficultyFilter || statusFilter || searchQuery) && (
      <div className="flex items-center justify-between pt-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-500 mr-2">Active Filters:</span>
          
          {searchQuery && (
            <span 
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-1 bg-slate-500/10 text-slate-300 border border-slate-500/20 px-2 py-1 rounded text-[10px] font-bold cursor-pointer hover:bg-slate-500/20 transition-colors"
            >
              Search: {searchQuery} <X size={10} />
            </span>
          )}

          {difficultyFilter && (
            <span 
              onClick={() => toggleDifficulty(difficultyFilter)}
              className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-[10px] font-bold cursor-pointer hover:bg-blue-500/20 transition-colors"
            >
              {difficultyFilter} <X size={10} />
            </span>
          )}

          {statusFilter && (
            <span 
              onClick={() => toggleStatus(statusFilter)}
              className="flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded text-[10px] font-bold cursor-pointer hover:bg-purple-500/20 transition-colors capitalize"
            >
              {statusFilter} <X size={10} />
            </span>
          )}
        </div>
        <button onClick={clearFilters} className="text-slate-500 hover:text-slate-300 text-xs underline transition-colors">Clear all</button>
      </div>
    )}
  </div>
);

const ProblemRow = ({ problem, onClick }) => {
  const formatDifficulty = (diff) => {
    if (!diff) return 'Unknown';
    return diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
  };

  const difficultyTitle = formatDifficulty(problem.difficulty);

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Easy': return 'text-emerald-400 border-emerald-500/30';
      case 'Medium': return 'text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'text-pink-500 border-pink-500/30';
      default: return 'text-slate-400 border-slate-500/30';
    }
  };

  const status = problem.status || 'todo';
  const getStatusIcon = (status) => {
    switch(status) {
      case 'solved': return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'attempted': return <Wrench size={14} className="text-yellow-500" />;
      default: return <Circle size={14} className="text-slate-600" />;
    }
  };

  const leftBorderClass = status === 'solved' 
    ? "border-l-emerald-500" 
    : "border-l-transparent group-hover:border-l-cyan-400";

  return (
    <div 
      onClick={() => onClick(problem.id)}
      className={`group grid grid-cols-[50px_1fr_120px_100px_120px] gap-4 items-center bg-[#0b0f19] border border-[#1a1f2e] border-l-2 ${leftBorderClass} rounded-xl p-4 transition-all duration-300 hover:bg-[#111624] mb-3 cursor-pointer`}
    >
      <div className="flex justify-center">
        {getStatusIcon(status)}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors">
            {problem.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {problem.topics && problem.topics.length > 0 ? (
            problem.topics.map((tag, idx) => (
              <span key={idx} className="bg-[#1e2536] text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded">
                {tag}
              </span>
            ))
          ) : (
            <span className="bg-[#1e2536] text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded">
              Algorithms
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-white font-semibold text-xs">{problem.points} pts</span>
      </div>

      <div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getDifficultyColor(difficultyTitle)}`}>
          {difficultyTitle}
        </span>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick(problem.id);
          }}
          className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)] active:scale-95"
        >
          Solve Now
        </button>
      </div>
    </div>
  );
};

const RightSidebar = () => (
  <div className="flex flex-col gap-6">
    <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-6">
        <PieChart size={18} className="text-purple-500" />
        <h3 className="text-white font-bold">Your Progress</h3>
      </div>
      <div className="flex flex-col gap-4">
        {/* Progress Bars Placeholder */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-emerald-400 font-bold">Easy</span>
            <span className="text-slate-400 font-medium">12 / 45</span>
          </div>
          <div className="w-full h-1.5 bg-[#1a1f2e] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-[26%] rounded-full shadow-[0_0_8px_#34d399]"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);


// --- MAIN PAGE LAYOUT ---

const Practicepage = () => {
  const navigate = useNavigate();
  const [problemsData, setProblemsData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsConsent, setNeedsConsent] = useState(false);
  const [consentUrl, setConsentUrl] = useState("");

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState(null); // 'EASY', 'MEDIUM', 'HARD'
  const [statusFilter, setStatusFilter] = useState(null); // 'todo', 'solved', 'attempted'

  // Fetch problems from backend on component mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        const [problemsResponse, profileResponse] = await Promise.all([
          axios.get(`${baseURL}/problems`, { headers }),
          axios.get(`${baseURL}/profile`, { headers }).catch(() => ({ data: null }))
        ]);

        setProfileData(profileResponse.data || null);
        const response = problemsResponse;
        console.log("Fetched problems:", response.data);
        const contentType = response.headers && (response.headers['content-type'] || response.headers['Content-Type']);
        // Some proxies (ngrok free) may return an HTML error page. Detect that and show a helpful error.
        const bodyIsHtml = typeof response.data === 'string' && /<\/?html/i.test(response.data.trim());
        if (bodyIsHtml || (contentType && typeof contentType === 'string' && contentType.includes('text/html'))) {
          console.error('Backend returned HTML instead of JSON:', response.data);
          // derive host URL from baseURL (strip trailing /api)
          const host = (baseURL || '').replace(/\/api\/?$/i, '') || baseURL;
          setNeedsConsent(true);
          setConsentUrl(host);
          setError('This ngrok tunnel requires a visit/consent step before returning JSON.');
          setProblemsData([]);
          return;
        }
        // Normalize response to an array. Backend should return an array, but
        // some proxies or wrappers may return { data: [...] } or an object.
        const payload = response.data;
        const normalizeProblems = (raw) => {
          if (Array.isArray(raw)) return raw;
          if (raw && Array.isArray(raw.data)) return raw.data;
          return raw ? [raw] : [];
        };

        const baseProblems = normalizeProblems(payload);

        const enrichedProblems = await Promise.all(
          baseProblems.map(async (problem) => {
            try {
              const detailRes = await axios.get(`${baseURL}/problem/${problem.id}`, { headers });
              const detail = detailRes.data || {};
              const solved = Boolean(detail.solvedByUser);
              const hasAttempts = Array.isArray(detail.mySubmissions) && detail.mySubmissions.length > 0;
              return {
                ...problem,
                status: solved ? 'solved' : (hasAttempts ? 'attempted' : 'todo')
              };
            } catch {
              return {
                ...problem,
                status: problem.status || 'todo'
              };
            }
          })
        );

        if (Array.isArray(payload)) {
          setProblemsData(enrichedProblems);
        } else if (payload && Array.isArray(payload.data)) {
          setProblemsData(enrichedProblems);
        } else {
          // Fallback: if it's a single object, wrap it; otherwise use empty array
          setProblemsData(enrichedProblems);
        }
      } catch (err) {
        console.error("Error fetching problems:", err);
        setError("Failed to load problems. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const getSolvedTodayCount = () => {
    const recentSubmissions = profileData?.recentSubmissions;
    if (!Array.isArray(recentSubmissions) || recentSubmissions.length === 0) {
      return 0;
    }

    const todayKey = new Date().toDateString();
    const solvedTodaySet = new Set();

    recentSubmissions.forEach((submission) => {
      if (!submission || submission.status !== 'AC' || !submission.submittedAt) return;
      const submittedDate = new Date(submission.submittedAt).toDateString();
      if (submittedDate === todayKey) {
        const problemKey = submission.problemId || submission.problem?.id || submission.id;
        solvedTodaySet.add(problemKey);
      }
    });

    return solvedTodaySet.size;
  };

  const handleProblemClick = (problemId) => {
    navigate(`/problem/${problemId}`);
  };

  // --- FILTER LOGIC ---
  const problemsArray = Array.isArray(problemsData) ? problemsData : (problemsData && Array.isArray(problemsData.data) ? problemsData.data : []);

  const sq = (searchQuery || '').toString().toLowerCase();

  const filteredProblems = problemsArray.filter(problem => {
    if (!problem || typeof problem !== 'object') return false;

    // 1. Search Filter (checks title and tags) - guard against undefined
    const title = (problem.title || '').toString().toLowerCase();
    const topics = Array.isArray(problem.topics) ? problem.topics : [];
    const matchesSearch = title.includes(sq) || topics.some(t => (t || '').toString().toLowerCase().includes(sq));

    // 2. Difficulty Filter
    const matchesDifficulty = difficultyFilter ? (problem.difficulty || '').toUpperCase() === difficultyFilter : true;

    // 3. Status Filter (defaulting to 'todo' if backend sends null)
    const probStatus = (problem.status || 'todo').toString();
    const matchesStatus = statusFilter ? probStatus.toLowerCase() === statusFilter : true;

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  // --- HANDLERS FOR FILTER COMPONENT ---
  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter(null);
    setStatusFilter(null);
  };

  const toggleDifficulty = (level) => setDifficultyFilter(prev => prev === level ? null : level);
  const toggleStatus = (status) => setStatusFilter(prev => prev === status ? null : status);

  const handleRandomClick = () => {
    if (filteredProblems.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredProblems.length);
      handleProblemClick(filteredProblems[randomIndex].id);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] font-sans pb-20">
      
      <div className="fixed top-0 left-1/4 w-[800px] h-[400px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <main className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <PracticeHeader
          streakDays={profileData?.streak || 0}
          solvedTodayCount={getSolvedTodayCount()}
        />
        
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
          
          <div className="flex flex-col">
            <SearchAndFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              difficultyFilter={difficultyFilter}
              toggleDifficulty={toggleDifficulty}
              statusFilter={statusFilter}
              toggleStatus={toggleStatus}
              clearFilters={clearFilters}
              onRandomClick={handleRandomClick}
            />
            
            <div className="hidden md:grid grid-cols-[50px_1fr_120px_100px_120px] gap-4 items-center px-4 py-3 border-b border-[#1a1f2e] mb-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Points</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Difficulty</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right pr-2">Action</div>
            </div>

            <div className="flex flex-col min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  <p className="text-slate-400 text-sm font-medium">Loading Arena Challenges...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center h-48 gap-3">
                  <p className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 text-sm text-center max-w-lg">
                    {error}
                  </p>
                  {needsConsent && consentUrl && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => window.open(consentUrl, '_blank')}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold"
                      >
                        Open tunnel page to consent
                      </button>
                      <button
                        onClick={() => {
                          setNeedsConsent(false);
                          setError('');
                        }}
                        className="text-slate-400 hover:text-white text-sm underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ) : problemsData.length === 0 ? (
                <div className="flex justify-center items-center h-48">
                  <p className="text-slate-500 text-sm">No problems found in the arena.</p>
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-48 gap-3">
                  <Filter className="w-8 h-8 text-slate-600" />
                  <p className="text-slate-400 text-sm">No problems match your exact filters.</p>
                  <button onClick={clearFilters} className="text-cyan-400 hover:text-cyan-300 text-xs font-bold underline transition-colors">Clear all filters</button>
                </div>
              ) : (
                filteredProblems.map(problem => (
                  <ProblemRow 
                    key={problem.id} 
                    problem={problem} 
                    onClick={handleProblemClick} 
                  />
                ))
              )}
            </div>
          </div>

          

        </div>
      </main>
    </div>
  );
};

export default Practicepage;