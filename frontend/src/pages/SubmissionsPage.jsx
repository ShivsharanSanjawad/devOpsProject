import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api';

const statusClass = (status) => {
  switch (status) {
    case 'AC':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    case 'WA':
    case 'RE':
    case 'CE':
    case 'TLE':
    case 'MLE':
      return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    case 'PENDING':
    case 'RUNNING':
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    default:
      return 'text-slate-300 bg-slate-700/20 border-slate-600/30';
  }
};

const SubmissionsPage = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${baseURL}/submissions/my`, { headers });
        setSubmissions(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load submissions.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-2">
          <Loader2 size={20} className="animate-spin text-cyan-400" />
          <span>Loading submissions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} />
            <h2 className="font-bold">Could not load submissions</h2>
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
          <h1 className="text-2xl font-bold text-white">My Submissions</h1>
          <button
            onClick={() => navigate('/practice')}
            className="px-4 py-2 text-sm rounded-lg bg-[#1e2536] hover:bg-[#2a3143] transition-colors"
          >
            Back to Practice
          </button>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-xl border border-[#1a1f2e] bg-[#0b0f19] p-8 text-center text-slate-400">
            No submissions yet.
          </div>
        ) : (
          <div className="rounded-xl border border-[#1a1f2e] bg-[#0b0f19] overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-[#1a1f2e] text-xs uppercase tracking-wider text-slate-500">
              <div className="col-span-4">Submission</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Runtime</div>
              <div className="col-span-2">Memory</div>
              <div className="col-span-2">Submitted</div>
            </div>

            {submissions.map((submission) => {
              const status = submission?.status || 'UNKNOWN';
              return (
                <div key={submission.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b last:border-b-0 border-[#1a1f2e] text-sm">
                  <div className="col-span-4">
                    <button
                      onClick={() => submission.problemId && navigate(`/problem/${submission.problemId}`)}
                      className="text-left hover:text-cyan-300 transition-colors"
                    >
                      {submission.problemId || submission.id}
                    </button>
                  </div>

                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-semibold ${statusClass(status)}`}>
                      {status === 'AC' ? <CheckCircle2 size={12} /> : status === 'PENDING' || status === 'RUNNING' ? <Clock size={12} /> : <XCircle size={12} />}
                      {status}
                    </span>
                  </div>

                  <div className="col-span-2 text-slate-400">{submission.timeMs ?? 0} ms</div>
                  <div className="col-span-2 text-slate-400">{submission.memoryKb ?? 0} KB</div>
                  <div className="col-span-2 text-slate-400">{submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '-'}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsPage;
