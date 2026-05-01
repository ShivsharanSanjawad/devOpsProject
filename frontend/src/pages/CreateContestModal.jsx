import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { X, Calendar as CalendarIcon, Rocket, Plus, Search, ListChecks, Trash2, Loader2 } from 'lucide-react';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api';

const getDifficultyColor = (difficulty) => {
  const normalized = String(difficulty || '').toUpperCase();
  if (normalized.includes('EASY')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (normalized === 'MEDIUM') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  if (normalized.includes('HARD')) return 'text-red-400 bg-red-400/10 border-red-400/20';
  return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
};

const toJavaLocalDateTime = (value) => {
  if (!value) return null;
  return value.length === 16 ? `${value}:00` : value;
};

const CreateContestModal = ({ isOpen = true, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [problemBank, setProblemBank] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [isLoadingProblems, setIsLoadingProblems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const loadProblems = async () => {
      try {
        setError('');
        setIsLoadingProblems(true);
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${baseURL}/problems`, { headers });
        const normalized = (response.data || []).map((problem) => ({
          ...problem,
          tags: Array.isArray(problem.tags) ? problem.tags : [],
        }));

        setProblemBank(normalized);
      } catch (err) {
        console.error('Failed to load problems', err);
        setError('Failed to load problem bank.');
      } finally {
        setIsLoadingProblems(false);
      }
    };

    loadProblems();
  }, [isOpen]);

  const filteredQuestions = useMemo(
    () =>
      problemBank.filter(
        (question) =>
          !selectedQuestions.some((selected) => selected.id === question.id) &&
          String(question.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [problemBank, selectedQuestions, searchQuery]
  );

  if (!isOpen) return null;

  const handleAddQuestion = (question) => {
    if (selectedQuestions.length >= 5) return;
    if (selectedQuestions.some((selected) => selected.id === question.id)) return;

    setSelectedQuestions((prev) => [...prev, question]);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const handleRemoveQuestion = (id) => {
    setSelectedQuestions((prev) => prev.filter((question) => question.id !== id));
  };

  const handleCreateContest = async () => {
    if (!title.trim()) {
      setError('Contest title is required.');
      return;
    }

    if (!startTime || !endTime) {
      setError('Start and end date/time are required.');
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError('End time must be after start time.');
      return;
    }

    if (selectedQuestions.length === 0) {
      setError('Select at least one problem.');
      return;
    }

    if (selectedQuestions.some((question) => !question.id)) {
      setError('One selected problem has an invalid ID.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);

      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        title: title.trim(),
        description: description.trim(),
        startTime: toJavaLocalDateTime(startTime),
        endTime: toJavaLocalDateTime(endTime),
        problems: selectedQuestions.map((question, index) => ({
          problemId: question.id,
          displayOrder: index + 1,
        })),
      };

      await axios.post(`${baseURL}/contests`, payload, { headers });
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      if (err?.response?.status === 403) {
        setError('Only admin can create contests.');
      } else {
        setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to create contest.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden font-sans z-10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1f2e] shrink-0 bg-[#0b0f19]">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Create Contest</h2>
            <p className="text-slate-400 text-sm">Configure contest details and select problems.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-[#1a1f2e] rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-300 mb-2">Contest Name</label>
                <input value={title} onChange={(event) => setTitle(event.target.value)} type="text" className="w-full bg-[#05070a] border border-[#1a1f2e] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-300 mb-2">Description</label>
                <textarea rows="3" value={description} onChange={(event) => setDescription(event.target.value)} className="w-full bg-[#05070a] border border-[#1a1f2e] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 resize-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[11px] font-black text-purple-400 uppercase tracking-widest">
                  <ListChecks size={14} /> Problem Selection
                </div>
                <div className="text-xs font-bold px-2.5 py-1 rounded-lg border bg-[#111624] text-slate-400 border-[#1a1f2e]">{selectedQuestions.length}/5 Selected</div>
              </div>

              <div className="relative mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder={selectedQuestions.length >= 5 ? 'Maximum 5 problems selected' : 'Search problem database...'}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    disabled={selectedQuestions.length >= 5}
                    className="w-full bg-[#05070a] border border-[#1a1f2e] text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500/50 placeholder-slate-600 disabled:opacity-60"
                  />
                </div>

                {isSearchFocused && searchQuery && filteredQuestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-[#111624] border border-[#1a1f2e] rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredQuestions.map((question) => (
                      <div key={question.id} onClick={() => handleAddQuestion(question)} className="flex items-center justify-between p-3 border-b border-[#1a1f2e] last:border-0 hover:bg-[#1a2035] cursor-pointer transition-colors group">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{question.title || 'Untitled Problem'}</span>
                          <span className="text-[10px] text-slate-500">{question.tags.length ? question.tags.join(', ') : 'No tags'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyColor(question.difficulty)}`}>{question.difficulty || 'N/A'}</span>
                          <button type="button" className="bg-purple-600 hover:bg-purple-500 text-white p-1 rounded-md transition-colors"><Plus size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isSearchFocused && <div className="fixed inset-0 z-40" onClick={() => setIsSearchFocused(false)}></div>}
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                {selectedQuestions.length === 0 ? (
                  <div className="bg-[#05070a] border border-[#1a1f2e] border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-slate-500">
                    <ListChecks size={24} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">{isLoadingProblems ? 'Loading problems...' : 'No problems selected yet.'}</p>
                  </div>
                ) : (
                  selectedQuestions.map((question, index) => (
                    <div key={question.id} className="flex items-center justify-between bg-[#111624] border border-[#1a1f2e] p-3.5 rounded-xl group">
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded bg-[#0b0f19] border border-[#1a1f2e] flex items-center justify-center text-xs font-black text-slate-500">{index + 1}</div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white leading-tight">{question.title || 'Untitled Problem'}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getDifficultyColor(question.difficulty)}`}>{question.difficulty || 'N/A'}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{question.points || 0} pts</span>
                          </div>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleRemoveQuestion(question.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-black text-blue-400 uppercase tracking-widest mb-4">
                <CalendarIcon size={14} /> Schedule
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-slate-300 mb-2">Start Date & Time</label>
                  <input type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="w-full bg-[#05070a] border border-[#1a1f2e] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-300 mb-2">End Date & Time</label>
                  <input type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="w-full bg-[#05070a] border border-[#1a1f2e] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#1a1f2e] bg-[#0b0f19] flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-medium text-slate-500">
            {error ? <span className="text-red-400">{error}</span> : <span className="text-emerald-500 flex items-center gap-1.5"><ListChecks size={14} /> {selectedQuestions.length}/5 Questions selected</span>}
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="button" disabled={isSubmitting} onClick={handleCreateContest} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
              {isSubmitting ? 'Creating...' : 'Create Contest'}
            </button>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1f2e; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2a3143; }
        `,
        }}
      />
    </div>
  );
};

export default CreateContestModal;
