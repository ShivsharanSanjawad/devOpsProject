import React, { useState, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Code2, Coins, Clock, Database, CheckCircle2,
  ChevronDown, CloudUpload, Terminal, ListTodo,
  AlertCircle, AlertTriangle, ChevronRight,
  Loader2, XCircle, ShieldAlert
} from 'lucide-react';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api';

const languageTemplates = {
  python: `# Read input from stdin using input()\n# Print output to stdout using print()\n\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\n// Read input from stdin (cin) and print output to stdout (cout)\nint main(){\n    \n    return 0;\n}`,
  java: `import java.util.*;\n\n// Class name must be Solution\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input from stdin and print output to stdout\n        \n    }\n}`
};

// Map verdicts to user-friendly text and colors
const getVerdictInfo = (status) => {
  switch (status) {
    case 'AC': return { text: 'Accepted', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <CheckCircle2 size={18} /> };
    case 'WA': return { text: 'Wrong Answer', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <XCircle size={18} /> };
    case 'TLE': return { text: 'Time Limit Exceeded', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: <Clock size={18} /> };
    case 'MLE': return { text: 'Memory Limit Exceeded', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: <Database size={18} /> };
    case 'RE': return { text: 'Runtime Error', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: <AlertTriangle size={18} /> };
    case 'CE': return { text: 'Compile Error', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: <Code2 size={18} /> };
    case 'PENDING':
    case 'RUNNING': return { text: 'Judging...', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: <Loader2 className="animate-spin" size={18} /> };
    case 'PENDING_MANUAL': return { text: 'Pending Manual Review', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: <Clock size={18} /> };
    default: return { text: status || 'Error', color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700', icon: <AlertCircle size={18} /> };
  }
};

const ProblemSolvingPage = () => {
  const { problemId } = useParams();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contestId'); // Get contestId from URL

  // Data States
  const [problemData, setProblemData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaderboardRefreshTrigger, setLeaderboardRefreshTrigger] = useState(0);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [selectedPreviousSubmissionId, setSelectedPreviousSubmissionId] = useState(null);
  const [hintResult, setHintResult] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState('');
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  const [plagiarismLoading, setPlagiarismLoading] = useState(false);
  const [plagiarismError, setPlagiarismError] = useState('');

  // Real-time leaderboard polling
  const leaderboardPollingRef = useRef(null);
  const pollingEnabledRef = useRef(false);

  // UI States
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('description');
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [consoleTab, setConsoleTab] = useState('testcases');
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);



  // Monaco Editor State
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(languageTemplates.python);

  // Fetch problem data on mount
  useEffect(() => {
    const fetchProblemData = async () => {
      // 1. Guard against bad URLs
      if (!problemId || problemId === 'undefined') {
        setError("Invalid Problem ID. Please select a valid problem from the Arena.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Ensure this endpoint exactly matches your Spring Boot @GetMapping path
        const response = await axios.get(`${baseURL}/problem/${problemId}`, { headers });

        setProblemData(response.data);
        if (response.data?.mySubmissions?.length > 0) {
          setSubmissionResult(response.data.mySubmissions[0]);
          setSelectedPreviousSubmissionId(response.data.mySubmissions[0].id);
        }
      } catch (err) {
        console.error("Error fetching problem:", err);

        // 2. Enhanced Error Extraction
        let errorMessage = "Failed to load problem details. ";

        if (err.response) {
          // Server responded with an error status (4xx, 5xx)
          errorMessage += `\nServer Error (${err.response.status}): ${err.response.data?.message || err.response.data?.error || 'No message provided by backend.'}`;
        } else if (err.request) {
          // No response received (Network error, CORS, Server offline)
          errorMessage += "\nBackend is unreachable. Check if the server is running and CORS is configured.";
        } else {
          errorMessage += err.message;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblemData();
  }, [problemId]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(languageTemplates[lang]);
  };

  const handleGetHints = async () => {
    if (!code.trim() || hintLoading) return;

    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      setHintLoading(true);
      setHintError('');

      const contextPayload = [
        `Problem Title: ${problemData?.title || ''}`,
        `Problem Description: ${getCoreDescription(problemData?.description || '')}`,
        `Constraints: ${(getCleanConstraints(problemData?.constraints || '') || []).join(' | ')}`,
        `Sample Cases: ${(problemData?.examples || []).map((ex, idx) => `Case ${idx + 1} Input: ${ex?.input || ''} Output: ${ex?.output || ''}`).join(' | ')}`,
        `Previous Verdict: ${submissionResult?.status || 'N/A'}`,
        `Compiler/Runtime Error: ${submissionResult?.compileError || 'N/A'}`
      ].join('\n');

      const response = await axios.post(`${baseURL}/hints`, {
        language,
        code,
        errors: contextPayload
      }, { headers });
      setHintResult(response.data);
    } catch (err) {
      setHintError(err?.response?.data?.message || 'Could not fetch hints right now.');
    } finally {
      setHintLoading(false);
    }
  };

  const handlePlagiarismCheck = async () => {
    if (!contestId || !code.trim() || plagiarismLoading) return;

    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      setPlagiarismLoading(true);
      setPlagiarismError('');
      const response = await axios.post(`${baseURL}/plagiarism-check`, {
        code,
        language,
        problemStatement: problemData?.description || ''
      }, { headers });
      setPlagiarismResult(response.data);
    } catch (err) {
      setPlagiarismError(err?.response?.data?.message || 'Could not run plagiarism analysis right now.');
    } finally {
      setPlagiarismLoading(false);
    }
  };

  // --- SUBMISSION LOGIC ---
  const handleSubmit = async () => {
    if (!code.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setConsoleTab('result');
    setSubmissionResult({ status: 'PENDING' });

    const token = localStorage.getItem("accessToken");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const submissionPayload = {
        problemId: problemId,
        language: language,
        code: code
      };

      // Add contestId if solving in contest mode
      if (contestId) {
        submissionPayload.contestId = contestId;
      }

      const postResponse = await axios.post(`${baseURL}/submissions`, submissionPayload, { headers });
      const { submissionId } = postResponse.data;

      let isJudged = false;
      let finalResult = null;

      while (!isJudged) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const getResponse = await axios.get(`${baseURL}/submissions/${submissionId}`, { headers });
        const currentStatus = getResponse.data.status;

        if (currentStatus !== 'PENDING' && currentStatus !== 'RUNNING') {
          isJudged = true;
          finalResult = getResponse.data;
        } else {
          setSubmissionResult(getResponse.data);
        }
      }

      setSubmissionResult(finalResult);

      if (contestId) {
        handlePlagiarismCheck();
      }

      // If AC verdict and in contest mode, trigger leaderboard refresh and polling
      if (finalResult?.status === 'AC' && contestId) {
        console.log("✓ AC Verdict! Triggering leaderboard refresh...");
        setLeaderboardRefreshTrigger(prev => prev + 1);

        // Enable polling to update leaderboard for all users
        pollingEnabledRef.current = true;

        // Show success and redirect after 3 seconds
        setTimeout(() => {
          navigate(`/contest-arena?contestId=${contestId}`);
        }, 3000);
      }

    } catch (err) {
      console.error("Submission failed:", err);
      setSubmissionResult({ status: 'ERROR', compileError: 'Network or server error occurred during submission.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers for text parsing
  const getCoreDescription = (fullDescription) => {
    if (!fullDescription) return "";
    const splitDesc = fullDescription.split(/###\s*(Input Format|Example|Constraints)/i)[0];
    return splitDesc.replace('## Problem Description', '').trim();
  };

  const getCleanConstraints = (constraintsStr) => {
    if (!constraintsStr) return [];
    return constraintsStr
      .replace('### Constraints', '')
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace('-', '').trim());
  };

  // --- LOADING RENDER ---
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#05070a] text-cyan-400 font-sans">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-slate-400 font-medium tracking-wide">Loading Arena Workspace...</p>
      </div>
    );
  }

  // --- ERROR RENDER ---
  if (error || !problemData) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#05070a] font-sans">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-6 rounded-xl max-w-lg text-center shadow-2xl">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-bold mb-2 text-white">Access Denied</h3>
          <p className="text-sm whitespace-pre-wrap">{error || "Problem not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="h-screen flex flex-col bg-[#05070a] text-slate-300 font-sans overflow-hidden selection:bg-purple-500/30">

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT PANEL: 40% WIDTH - Problem Details */}
        <div className="w-[40%] flex flex-col border-r border-[#1a1f2e] bg-[#0b0f19]">

          <div className="h-[50px] flex items-center justify-between px-4 border-b border-[#1a1f2e] bg-[#0b0f19] shrink-0">
            <div className="flex items-center gap-4 text-[13px] font-semibold text-slate-400">
              <button
                className={`flex items-center gap-1.5 h-full ${activeTab === 'description' ? 'text-white' : 'hover:text-slate-200'}`}
                onClick={() => setActiveTab('description')}
              >
                <div className={`w-2 h-2 rounded-full ${problemData.difficulty === 'EASY' ? 'bg-emerald-500' :
                  problemData.difficulty === 'MEDIUM' ? 'bg-yellow-500' : 'bg-pink-500'
                  }`}></div>
                {problemData.difficulty}
              </button>

              <button
                className="hover:text-slate-200 transition-colors"
                onClick={() => navigate('/submissions')}
              >
                Submissions
              </button>
              <button
                className="hover:text-slate-200 transition-colors"
                onClick={() => navigate(`/solutions/${problemId}`)}
              >
                Solutions
              </button>
            </div>

          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-3 flex flex-wrap items-center gap-3">
                {problemData.title}
                {problemData.topics?.map((topic, idx) => (
                  <span key={idx} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#1e2536] text-slate-300 font-medium">
                    #{topic}
                  </span>
                ))}
              </h2>
            </div>

            <div className="flex flex-col xl:flex-row flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-2 text-[13px] text-slate-400 bg-[#111624] w-fit px-3 py-1.5 rounded-lg border border-[#1a1f2e]">
                <Clock size={14} className="text-purple-400" /> Time Limit: {problemData.timeLimitMs / 1000}s
              </div>
              <div className="flex items-center gap-2 text-[13px] text-slate-400 bg-[#111624] w-fit px-3 py-1.5 rounded-lg border border-[#1a1f2e]">
                <Database size={14} className="text-cyan-400" /> Memory Limit: {problemData.memoryLimitMb}MB
              </div>
              <div className="flex items-center gap-2 text-[13px] text-slate-400 bg-[#111624] w-fit px-3 py-1.5 rounded-lg border border-[#1a1f2e]">
                <CheckCircle2 size={14} className="text-emerald-500" /> Acceptance: {problemData.acceptanceRate || 0}%
              </div>
              <div className="flex items-center gap-2 text-[13px] text-slate-400 bg-[#111624] w-fit px-3 py-1.5 rounded-lg border border-[#1a1f2e]">
                <Coins size={14} className="text-yellow-500" /> Points: {problemData.points}
              </div>
            </div>

            <div className="text-[14px] leading-relaxed text-slate-300 mb-8 space-y-4 whitespace-pre-wrap">
              {getCoreDescription(problemData.description)}
            </div>

            <div className="space-y-6 mb-8">
              {problemData.examples?.map((ex, idx) => (
                <div key={idx}>
                  <p className="text-[12px] font-bold text-slate-400 tracking-wider mb-2">EXAMPLE {ex.order || idx + 1}</p>
                  <div className="bg-[#111624] border border-[#1a1f2e] rounded-xl p-4 font-mono text-[13px] space-y-3">
                    <div>
                      <span className="text-slate-500">Input:</span><br />
                      <span className="text-white">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Output:</span><br />
                      <span className="text-white">{ex.output}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <p className="text-[12px] font-bold text-yellow-500 tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle size={14} /> CONSTRAINTS
              </p>
              <ul className="list-disc list-inside space-y-2 text-[13px] font-mono text-slate-300 marker:text-slate-600">
                {getCleanConstraints(problemData.constraints).map((constraint, idx) => (
                  <li key={idx}><code className="bg-[#111624] px-1.5 py-0.5 rounded border border-[#1a1f2e]">{constraint}</code></li>
                ))}
              </ul>
            </div>

            <div
              onClick={() => setIsSolutionOpen(true)}
              className="bg-gradient-to-br from-[#17112c] to-[#0d121c] border border-purple-500/20 rounded-xl p-5 flex items-center justify-between group cursor-pointer hover:border-purple-500/40 transition-colors"
            >
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Stuck? Check Discussion & Solutions</h4>
                <p className="text-slate-400 text-xs">See how top rankers solved this problem with O(n) complexity.</p>
              </div>
              <ChevronRight className="text-purple-400 group-hover:translate-x-1 transition-transform" size={20} />
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: 60% WIDTH - Editor & Console */}
        <div className="w-[60%] flex flex-col bg-[#05070a] relative">

          <div className="h-[50px] flex items-center justify-between px-4 border-b border-[#1a1f2e] bg-[#0b0f19] shrink-0">
            <div className="flex items-center gap-3">

              <div className="relative flex items-center">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="appearance-none bg-[#1e2536] text-slate-300 text-[13px] font-semibold pl-3 pr-8 py-1.5 rounded-lg border border-[#2a3143] hover:bg-[#2a3143] focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
                >
                  <option value="python">Python 3</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
                <ChevronDown size={14} className="text-slate-500 absolute right-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[13px] font-bold px-4 py-1.5 rounded-lg shadow-[0_0_10px_rgba(147,51,234,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
                {isSubmitting ? 'Judging...' : 'Submit'}
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                fontSize: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  useShadows: false,
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                }
              }}
            />
          </div>

          {/* Bottom Console Panel */}
          <div className="h-[250px] flex flex-col border-t border-[#1a1f2e] bg-[#0b0f19] shrink-0">
            <div className="flex items-center gap-6 px-4 border-b border-[#1a1f2e] bg-[#0b0f19]">
              <button
                className={`flex items-center gap-2 py-3 text-[13px] font-bold border-b-2 transition-colors ${consoleTab === 'testcases' ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
                onClick={() => setConsoleTab('testcases')}
              >
                <Terminal size={14} /> Test Cases
              </button>
              <button
                className={`flex items-center gap-2 py-3 text-[13px] font-bold border-b-2 transition-colors ${consoleTab === 'result' ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
                onClick={() => setConsoleTab('result')}
              >
                <ListTodo size={14} /> Result
              </button>
            </div>

            {/* Test Cases Area */}
            {consoleTab === 'testcases' && problemData.examples && (
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 mb-4">
                  {problemData.examples.map((ex, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestCase(idx)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeTestCase === idx ? 'bg-[#1e2536] text-white border border-[#2a3143]' : 'text-slate-400 hover:bg-[#111624]'}`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 tracking-wider mb-2">INPUT =</label>
                    <textarea
                      value={problemData.examples[activeTestCase]?.input || ""}
                      readOnly
                      rows={2}
                      className="w-full bg-[#05070a] border border-[#1a1f2e] text-slate-300 font-mono text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-cyan-500/50 resize-none custom-scrollbar"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 tracking-wider mb-2">EXPECTED OUTPUT =</label>
                    <input
                      type="text"
                      value={problemData.examples[activeTestCase]?.output || ""}
                      readOnly
                      className="w-full bg-[#05070a] border border-[#1a1f2e] text-slate-300 font-mono text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Result Area */}
            {consoleTab === 'result' && (
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                {!submissionResult && !isSubmitting ? (
                  <p className="text-slate-500 text-sm flex items-center h-full justify-center">Run or Submit your code to see the evaluation results.</p>
                ) : (
                  <div>
                    {/* Active Verdict Status Banner */}
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border mb-4 ${getVerdictInfo(submissionResult?.status).bg} ${getVerdictInfo(submissionResult?.status).border}`}>
                      <span className={getVerdictInfo(submissionResult?.status).color}>
                        {getVerdictInfo(submissionResult?.status).icon}
                      </span>
                      <h3 className={`text-lg font-bold ${getVerdictInfo(submissionResult?.status).color}`}>
                        {getVerdictInfo(submissionResult?.status).text}
                      </h3>
                    </div>

                    {/* AC Verdict in Contest - Show Success & Redirect Message */}
                    {submissionResult?.status === 'AC' && contestId && (
                      <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-4 py-4 rounded-lg mb-4 animate-pulse">
                        <p className="text-sm font-bold mb-2">🎉 Problem Solved!</p>
                        <p className="text-xs mb-2">Updating leaderboard for all participants...</p>
                        <p className="text-xs text-emerald-400">Redirecting to arena in 3 seconds</p>
                      </div>
                    )}

                    {/* Performance Stats (Hide if pending or compile error) */}
                    {submissionResult?.status !== 'PENDING' && submissionResult?.status !== 'RUNNING' && submissionResult?.status !== 'CE' && submissionResult?.status !== 'ERROR' && (
                      <div className="flex gap-6 mb-4 px-2">
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Runtime</p>
                          <p className="text-slate-300 font-mono text-sm">{submissionResult.timeMs || 0} ms</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Memory</p>
                          <p className="text-slate-300 font-mono text-sm">{submissionResult.memoryKb || 0} KB</p>
                        </div>
                      </div>
                    )}

                    {/* Compile Error Output */}
                    {submissionResult?.compileError && (
                      <div className="mt-4">
                        <p className="text-[11px] font-bold text-pink-400 mb-2 tracking-wider uppercase">Compiler Output</p>
                        <pre className="bg-pink-500/5 border border-pink-500/20 text-pink-200/80 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                          {submissionResult.compileError}
                        </pre>
                      </div>
                    )}

                    {/* Auto Plagiarism Result */}
                    {submissionResult?.plagiarismVerdict && (
                      <div className="mt-4 border-t border-[#1a1f2e] pt-4">
                        <div className={`rounded-lg border p-4 space-y-3 ${submissionResult.plagiarismVerdict === 'LIKELY_ORIGINAL' ? 'bg-emerald-500/5 border-emerald-500/20' :
                          submissionResult.plagiarismVerdict === 'SUSPICIOUS' ? 'bg-yellow-500/5 border-yellow-500/20' :
                            'bg-red-500/5 border-red-500/20'
                          }`}>
                          <div className="flex items-center gap-2">
                            <ShieldAlert size={14} className={submissionResult.plagiarismVerdict === 'LIKELY_ORIGINAL' ? 'text-emerald-400' : submissionResult.plagiarismVerdict === 'SUSPICIOUS' ? 'text-yellow-400' : 'text-red-400'} />
                            <span className={`text-sm font-bold ${submissionResult.plagiarismVerdict === 'LIKELY_ORIGINAL' ? 'text-emerald-400' :
                              submissionResult.plagiarismVerdict === 'SUSPICIOUS' ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                              {submissionResult.plagiarismVerdict.replace(/_/g, ' ')}
                            </span>
                            {submissionResult.plagiarismPenalty && (
                              <span className="ml-auto text-red-400 text-[10px] font-bold uppercase bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">Penalty Applied</span>
                            )}
                          </div>

                          {submissionResult.originalityScore != null && (
                            <div className="flex gap-6 text-xs">
                              <div>
                                <span className="text-slate-500">Originality </span>
                                <span className="text-slate-200 font-mono font-bold">{submissionResult.originalityScore}%</span>
                              </div>
                              <div>
                                <span className="text-slate-500">AI Likelihood </span>
                                <span className="text-slate-200 font-mono font-bold">{submissionResult.aiLikelihood}%</span>
                              </div>
                            </div>
                          )}

                          {submissionResult.originalityScore != null && (
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all ${submissionResult.originalityScore >= 70 ? 'bg-emerald-500' :
                                submissionResult.originalityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`} style={{ width: `${submissionResult.originalityScore}%` }} />
                            </div>
                          )}

                          {submissionResult.plagiarismExplanation && (
                            <p className="text-slate-400 text-xs leading-relaxed">{submissionResult.plagiarismExplanation}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>


      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #05070a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1f2e; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2a3143; }
      `}} />
    </div>
  );
};

export default ProblemSolvingPage;