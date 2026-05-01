import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Crown, Plus, Hourglass, History } from 'lucide-react';

import CreateContestModal from './CreateContestModal';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api';

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const getDurationText = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const totalMinutes = Math.max(0, Math.round((end - start) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const getTimeLeft = (endTime) => {
  const end = new Date(endTime);
  const now = new Date();
  const totalMinutes = Math.floor((end - now) / 60000);
  if (totalMinutes <= 0) return 'Ended';
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

const ContestsPage = () => {
  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [contests, setContests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const [leaderboardEntries, setLeaderboardEntries] = useState([]);
  const [leaderboardTitle, setLeaderboardTitle] = useState('Top Players');
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const query = activeFilter === 'all' ? '' : `?status=${activeFilter}`;

        const response = await axios.get(`${baseURL}/contests${query}`, { headers });
        setContests(response.data || []);
      } catch (err) {
        console.error('Failed to fetch contests', err);
        setError('Failed to load contests.');
        setContests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContests();
  }, [activeFilter, refreshTick]);

  const featuredContest = useMemo(
    () => contests.find((contest) => contest.status === 'ONGOING') || contests[0],
    [contests]
  );

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!featuredContest?.id) {
        setLeaderboardEntries([]);
        setLeaderboardTitle('Top Players');
        return;
      }

      try {
        setIsLoadingLeaderboard(true);
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${baseURL}/contests/${featuredContest.id}/leaderboard`, { headers });
        setLeaderboardEntries(response.data?.entries || []);
        setLeaderboardTitle(response.data?.contestTitle || featuredContest.title || 'Top Players');
      } catch (err) {
        console.error('Failed to load leaderboard', err);
        setLeaderboardEntries([]);
        setLeaderboardTitle(featuredContest.title || 'Top Players');
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [featuredContest]);

  const listContests = contests.filter((contest) => contest.id !== featuredContest?.id);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 font-sans relative overflow-x-hidden selection:bg-purple-500/30">
      <main className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 mt-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">
              CONTESTS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">ARENA</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base tracking-wide font-medium">Compete. Climb. Conquer.</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/50 hover:bg-purple-500/20 text-purple-300 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
          >
            <Plus size={16} strokeWidth={3} /> Add Contest
          </button>
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

        <div className="flex flex-wrap items-center gap-2 mb-8 bg-[#111624] p-1 rounded-xl border border-[#1a1f2e] w-fit">
          <button onClick={() => setActiveFilter('all')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter === 'all' ? 'text-white bg-white/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>All Contests</button>
          <button onClick={() => setActiveFilter('ongoing')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter === 'ongoing' ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Now
          </button>
          <button onClick={() => setActiveFilter('upcoming')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter === 'upcoming' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
            <Hourglass size={14} /> Upcoming
          </button>
          <button onClick={() => setActiveFilter('past')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeFilter === 'past' ? 'text-slate-200 bg-white/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
            <History size={14} /> Past
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-10">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-white font-bold text-lg uppercase tracking-wider">Running Contest</h2>
              </div>

              {isLoading ? (
                <div className="bg-[#0b0f19] rounded-2xl border border-[#1a1f2e] p-6 text-slate-400">Loading contests...</div>
              ) : featuredContest ? (
                <div className="bg-[#0b0f19] rounded-2xl border border-[#1a1f2e] p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-[10px] font-black text-red-400 bg-red-500/10 px-2.5 py-1 rounded uppercase tracking-widest border border-red-500/20">{featuredContest.status}</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-[#111624] px-2.5 py-1 rounded border border-[#1a1f2e] uppercase tracking-widest">{featuredContest.problemCount || 0} Problems</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">{featuredContest.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{featuredContest.description || 'No contest description available.'}</p>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-3">
                        <Users size={14} className="text-blue-400" />
                        <span className="text-white font-bold text-sm">{featuredContest.participantCount || 0} participants</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={14} className="text-purple-400" />
                        <span className="text-white font-bold text-sm">{getDurationText(featuredContest.startTime, featuredContest.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-[#1a1f2e] pt-6 md:pt-0 md:pl-8">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</span>
                    <div className="text-lg font-black text-red-500 mb-5 tracking-wider">{getTimeLeft(featuredContest.endTime)}</div>
                    <button
                      onClick={() => navigate(`/contest-arena?contestId=${featuredContest.id}`)}
                      className="w-full bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm"
                    >
                      Join Contest &raquo;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0b0f19] rounded-2xl border border-[#1a1f2e] p-6 text-slate-400">No contest available.</div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <Calendar size={18} className="text-blue-400" />
                <h2 className="text-white font-bold text-lg uppercase tracking-wider">Contests</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {listContests.map((contest) => (
                  <div key={contest.id} className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6 relative overflow-hidden group">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${contest.status === 'ONGOING' ? 'bg-red-500' : contest.status === 'UPCOMING' ? 'bg-blue-500' : 'bg-slate-500'}`}></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">{contest.title}</h3>
                        <p className="text-slate-400 text-xs">Starts: {formatDateTime(contest.startTime)}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[#111624] border border-[#1a1f2e] flex items-center justify-center text-purple-400 font-bold">{contest.problemCount || 0}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-[#111624] rounded-lg p-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                        <p className="text-white font-semibold text-sm">{getDurationText(contest.startTime, contest.endTime)}</p>
                      </div>
                      <div className="bg-[#111624] rounded-lg p-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Registered</p>
                        <p className="text-white font-semibold text-sm">{contest.participantCount || 0} Users</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold"><Clock size={14} /> {contest.status === 'UPCOMING' ? getTimeLeft(contest.startTime) : getTimeLeft(contest.endTime)}</div>

                      {contest.status === 'ENDED' ? (
                        <button className="bg-slate-600/10 border border-slate-500/30 text-slate-500 px-5 py-2 rounded-lg text-sm font-bold cursor-not-allowed">Ended</button>
                      ) : (
                        <button onClick={() => navigate(`/contest-arena?contestId=${contest.id}`)} className="bg-purple-600/10 border border-purple-500 hover:bg-purple-600 hover:text-white text-purple-400 px-5 py-2 rounded-lg text-sm font-bold transition-all">{contest.status === 'ONGOING' ? 'Join Now' : 'Enter Contest'}</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Crown size={18} className="text-yellow-500" />
                  <h3 className="text-white font-bold uppercase tracking-wider text-sm">{leaderboardTitle}</h3>
                </div>
              </div>

              <div className="flex flex-col gap-1 mb-6">
                {isLoadingLeaderboard ? (
                  <p className="text-slate-400 text-sm">Loading leaderboard...</p>
                ) : leaderboardEntries.length > 0 ? (
                  leaderboardEntries.slice(0, 5).map((entry) => (
                    <div key={entry.userId} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#111624] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-4 text-center ${entry.rank === 1 ? 'text-yellow-500' : 'text-slate-400'}`}>{entry.rank}</span>
                        <div className="w-8 h-8 rounded-full bg-[#1e2536] border border-[#2a3143] flex items-center justify-center text-xs font-bold text-slate-300">{(entry.username || '?').slice(0, 2).toUpperCase()}</div>
                        <div className="flex flex-col">
                          <span className="text-slate-200 font-bold text-sm leading-tight">{entry.username}</span>
                          <span className="text-slate-400 text-[10px]">Penalty: {entry.totalPenalty || 0}m</span>
                        </div>
                      </div>
                      <span className="text-white text-sm font-semibold">{entry.totalPoints || 0} pts</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No leaderboard data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreateContestModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreated={() => setRefreshTick((prev) => prev + 1)} />
    </div>
  );
};

export default ContestsPage;
