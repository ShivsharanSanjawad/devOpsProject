import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Code2, Loader2 } from 'lucide-react';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api';

const languageLabel = (key) => {
  const normalized = (key || '').toLowerCase();
  if (normalized === 'cpp' || normalized === 'c++') return 'C++';
  if (normalized === 'python' || normalized === 'py') return 'Python';
  if (normalized === 'java') return 'Java';
  return key?.toUpperCase() || 'UNKNOWN';
};

const SolutionPage = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [problemData, setProblemData] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProblemSolutions = async () => {
      if (!problemId) {
        setError('Missing problem id.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${baseURL}/problem/${problemId}`, { headers });
        const data = response.data;
        setProblemData(data);

        const solutionKeys = Object.keys(data?.solutions || {});
        if (solutionKeys.length > 0) {
          setActiveLanguage(solutionKeys[0]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load problem solutions.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblemSolutions();
  }, [problemId]);

  const solutionLanguages = useMemo(() => Object.keys(problemData?.solutions || {}), [problemData]);
  const activeSolution = problemData?.solutions?.[activeLanguage];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-2">
          <Loader2 size={20} className="animate-spin text-cyan-400" />
          <span>Loading solution...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center px-4">
        <div className="max-w-xl w-full rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} />
            <h2 className="font-bold">Could not load solution</h2>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 font-sans px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Solutions</h1>
            <p className="text-sm text-slate-400 mt-1">{problemData?.title || 'Problem'} • {problemId}</p>
          </div>
          <button
            onClick={() => navigate(`/problem/${problemId}`)}
            className="px-4 py-2 text-sm rounded-lg bg-[#1e2536] hover:bg-[#2a3143] transition-colors"
          >
            Back to Problem
          </button>
        </div>

        {solutionLanguages.length === 0 ? (
          <div className="rounded-xl border border-[#1a1f2e] bg-[#0b0f19] p-8 text-center text-slate-400">
            No official solution available for this problem yet.
          </div>
        ) : (
          <div className="rounded-xl border border-[#1a1f2e] bg-[#0b0f19] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1a1f2e] flex items-center gap-2 flex-wrap">
              {solutionLanguages.map((langKey) => (
                <button
                  key={langKey}
                  onClick={() => setActiveLanguage(langKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    activeLanguage === langKey
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-[#111624] text-slate-400 border-[#1a1f2e] hover:text-white'
                  }`}
                >
                  {languageLabel(langKey)}
                </button>
              ))}
            </div>

            <div className="p-4">
              {activeSolution?.explanation && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-2">Explanation</p>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{activeSolution.explanation}</p>
                </div>
              )}

              <div>
                <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <Code2 size={12} className="text-cyan-400" /> Code
                </p>
                <pre className="bg-[#05070a] border border-[#1a1f2e] text-slate-300 text-xs rounded-lg p-4 overflow-x-auto">
                  {activeSolution?.code || 'No solution code available for this language.'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolutionPage;
