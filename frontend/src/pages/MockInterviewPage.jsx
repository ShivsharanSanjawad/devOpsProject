import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Mic, MicOff, Video as VideoIcon, VideoOff,
  Bot, Volume2, RotateCcw, CheckCircle2,
  AlertCircle, Loader2
} from 'lucide-react';

// --- FALLBACK QUESTIONS ---
const fallbackQuestions = [
  {
    id: 1,
    difficulty: "Medium",
    text: "Tell me about your experience with Frontend development. What technologies have you worked with and what challenges have you faced?",
    topics: ["technical knowledge", "problem solving", "experience"]
  },
  {
    id: 2,
    difficulty: "Hard",
    text: "Explain the concept of React Server Components and how they differ from traditional Client Components. What are the performance implications?",
    topics: ["react", "performance", "architecture"]
  }
];

const API_BASE = import.meta.env.VITE_BASE_URL || "http://localhost:8080/api";

const MockInterviewPage = () => {
  // --- STATES ---
  const [questions, setQuestions] = useState(fallbackQuestions);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [interviewState, setInterviewState] = useState('setup');
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Setup form state
  const [role, setRole] = useState("Frontend Developer");
  const [questionCount, setQuestionCount] = useState(3);
  const [difficultyPref, setDifficultyPref] = useState("Mixed");

  // Overall interview summary
  const [allEvaluations, setAllEvaluations] = useState([]);

  // --- REFS ---
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const isRecordingRef = useRef(false);
  const isMicOnRef = useRef(true);
  const transcriptRef = useRef("");

  // Keep refs in sync
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  const currentQuestion = questions[currentQIndex] || fallbackQuestions[0];

  // --- 1. WEBCAM (init once, toggle tracks) ---
  useEffect(() => {
    let mounted = true;
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera init error:", err);
        if (mounted) setIsCameraOn(false);
      }
    };
    initCamera();
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Toggle video track on/off without re-requesting permissions
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = isCameraOn; });
    }
  }, [isCameraOn]);

  // --- 2. TEXT-TO-SPEECH ---
  const speakQuestion = useCallback((text) => {
    const synth = synthRef.current;
    if (!synth) return;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const voices = synth.getVoices();
    const preferred = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    synth.speak(utterance);
  }, []);

  useEffect(() => {
    if (interviewState === 'answering' && currentQuestion) {
      speakQuestion(currentQuestion.text);
    } else {
      synthRef.current?.cancel();
      setIsAiSpeaking(false);
    }
  }, [currentQIndex, interviewState, speakQuestion, currentQuestion]);

  // --- 3. SPEECH-TO-TEXT (init ONCE) ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalBatch = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalBatch += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (finalBatch) {
        setTranscript(prev => prev + finalBatch);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart only if still supposed to be recording
      if (isRecordingRef.current && isMicOnRef.current) {
        try { recognition.start(); } catch (e) { /* already started */ }
      } else {
        setIsRecording(false);
        setInterimTranscript('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch (e) { /* noop */ }
    };
  }, []); // Init ONCE — uses refs for current state

  const toggleRecording = useCallback(() => {
    if (!isMicOnRef.current) {
      alert("Please unmute your microphone first.");
      return;
    }
    if (isRecordingRef.current) {
      setIsRecording(false);
      try { recognitionRef.current?.stop(); } catch (e) { /* noop */ }
      setInterimTranscript('');
    } else {
      setIsRecording(true);
      synthRef.current?.cancel();
      setIsAiSpeaking(false);
      try { recognitionRef.current?.start(); } catch (e) { console.error(e); }
    }
  }, []);

  // --- TIMER ---
  useEffect(() => {
    if (interviewState !== 'answering') return;
    const interval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [interviewState]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- AUTH ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // --- HANDLERS ---
  const handleStartInterview = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await axios.post(`${API_BASE}/interview/questions`, {
        role,
        count: questionCount,
        difficulty: difficultyPref
      }, { headers: getAuthHeaders() });

      if (response.data.questions?.length > 0) {
        setQuestions(response.data.questions);
      }
    } catch (err) {
      console.error("Failed to generate questions, using fallback:", err);
    } finally {
      setIsLoadingQuestions(false);
      setCurrentQIndex(0);
      setTranscript("");
      setInterimTranscript("");
      setTimeElapsed(0);
      setAllEvaluations([]);
      setEvaluation(null);
      setInterviewState('answering');
    }
  };

  const handleSubmit = async () => {
    // Stop recording first, then wait for final transcript to settle
    if (isRecordingRef.current) {
      setIsRecording(false);
      try { recognitionRef.current?.stop(); } catch (e) { /* noop */ }
    }
    synthRef.current?.cancel();
    setIsAiSpeaking(false);

    // Small delay to let the last speech recognition results finalize
    await new Promise(resolve => setTimeout(resolve, 400));

    setInterviewState('evaluating');

    // Read the latest transcript from ref (state may not have flushed yet)
    const currentAnswer = (transcriptRef.current + interimTranscript).trim();
    setInterimTranscript('');

    if (currentAnswer.length < 5) {
      setEvaluation({
        overall: 0,
        metrics: [
          { label: "Technical", score: 0 },
          { label: "Communication", score: 0 },
          { label: "Depth", score: 0 },
          { label: "Relevance", score: 0 }
        ],
        strengths: "No answer provided",
        improvements: "Please provide a substantive answer to get meaningful feedback",
        detailedFeedback: "Your answer was too short to evaluate. Try to speak for at least 30 seconds."
      });
      setInterviewState('feedback');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/interview/evaluate`, {
        question: currentQuestion.text,
        answer: currentAnswer,
        topics: currentQuestion.topics.join(", "),
        difficulty: currentQuestion.difficulty
      }, { headers: getAuthHeaders() });

      const evalData = response.data;
      setEvaluation(evalData);
      setAllEvaluations(prev => [...prev, { questionIndex: currentQIndex, ...evalData }]);
      setInterviewState('feedback');
    } catch (err) {
      console.error("Evaluation failed:", err);
      setEvaluation({
        overall: 0,
        metrics: [
          { label: "Technical", score: 0 },
          { label: "Communication", score: 0 },
          { label: "Depth", score: 0 },
          { label: "Relevance", score: 0 }
        ],
        strengths: "Evaluation unavailable",
        improvements: "Please try again",
        detailedFeedback: "Could not reach AI evaluation service. Please check your connection and try again."
      });
      setInterviewState('feedback');
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setTranscript("");
      setInterimTranscript("");
      setTimeElapsed(0);
      setEvaluation(null);
      setInterviewState('answering');
    } else {
      setInterviewState('completed');
    }
  };

  return (
    <div className="min-h-screen bg-[#111624] text-slate-300 font-sans flex flex-col selection:bg-blue-500/30">

      {/* --- SETUP SCREEN --- */}
      {interviewState === 'setup' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Bot size={32} className="text-blue-400" />
              <h1 className="text-white font-black text-2xl">AI Mock Interview</h1>
            </div>
            <p className="text-slate-400 text-sm text-center mb-8">
              Configure your interview session. Gemini AI will generate tailored questions and evaluate your answers in real-time.
            </p>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-300 mb-1.5 block">Target Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#111624] border border-[#1a1f2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="e.g. Frontend Developer, Backend Engineer..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-1.5 block">Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full bg-[#111624] border border-[#1a1f2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    {[2, 3, 5, 7, 10].map(n => (
                      <option key={n} value={n}>{n} questions</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-300 mb-1.5 block">Difficulty</label>
                  <select
                    value={difficultyPref}
                    onChange={(e) => setDifficultyPref(e.target.value)}
                    className="w-full bg-[#111624] border border-[#1a1f2e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    {["Easy", "Medium", "Hard", "Mixed"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleStartInterview}
                disabled={isLoadingQuestions || !role.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#1a1f2e] disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {isLoadingQuestions ? (
                  <><Loader2 size={18} className="animate-spin" /> Generating Questions...</>
                ) : (
                  'Start Interview'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- COMPLETED SCREEN --- */}
      {interviewState === 'completed' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-center gap-3 mb-6">
              <CheckCircle2 size={32} className="text-emerald-400" />
              <h1 className="text-white font-black text-2xl">Interview Complete!</h1>
            </div>

            {/* Overall Score */}
            {allEvaluations.length > 0 && (() => {
              const avgScore = Math.round(allEvaluations.reduce((s, e) => s + e.overall, 0) / allEvaluations.length);
              return (
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-3 ${avgScore >= 8 ? 'border-emerald-500 text-emerald-400' : avgScore >= 5 ? 'border-blue-500 text-blue-400' : 'border-yellow-500 text-yellow-400'
                    }`}>
                    <span className="text-3xl font-black">{avgScore}</span>
                    <span className="text-lg font-bold">/10</span>
                  </div>
                  <p className="text-slate-400 text-sm">Overall Performance Score</p>
                </div>
              );
            })()}

            {/* Per-question breakdown */}
            <div className="space-y-4 mb-8">
              {allEvaluations.map((ev, idx) => (
                <div key={idx} className="bg-[#111624] border border-[#1a1f2e] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-sm">Question {idx + 1}</h3>
                    <span className={`text-lg font-black ${ev.overall >= 8 ? 'text-emerald-400' : ev.overall >= 5 ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {ev.overall}/10
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mb-3 line-clamp-1">{questions[ev.questionIndex]?.text}</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {ev.metrics?.map((m, mi) => (
                      <div key={mi} className="text-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{m.label}</span>
                        <p className={`font-bold text-sm ${m.score >= 8 ? 'text-emerald-400' : m.score >= 5 ? 'text-blue-400' : 'text-yellow-400'}`}>{m.score}</p>
                      </div>
                    ))}
                  </div>
                  {ev.detailedFeedback && (
                    <p className="text-slate-400 text-xs leading-relaxed">{ev.detailedFeedback}</p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setInterviewState('setup')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
            >
              Start New Interview
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN INTERVIEW AREA --- */}
      {(interviewState === 'answering' || interviewState === 'evaluating' || interviewState === 'feedback') && (
        <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">

          {/* Ambient Background Particles (Decorative) */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-500 rounded-full blur-[2px] animate-pulse"></div>
          <div className="absolute bottom-40 right-20 w-2 h-2 bg-purple-500 rounded-full blur-[2px] animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-emerald-500 rounded-full blur-[3px] animate-pulse delay-700"></div>

          {/* ========================================== */}
          {/* LEFT COLUMN: AI INTERVIEWER & CONTEXT      */}
          {/* ========================================== */}
          <div className="flex flex-col gap-6 relative z-10">

            {/* AI Avatar Panel */}
            <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
              <h2 className="text-white font-bold flex items-center gap-2 mb-8">
                <Bot size={20} className="text-blue-400" /> AI Interviewer
              </h2>

              {/* Pulsing Avatar */}
              <div className="relative mb-8">
                <div className={`absolute inset-0 bg-blue-600 rounded-full opacity-20 ${isAiSpeaking ? 'animate-ping' : interviewState === 'evaluating' ? 'animate-pulse' : ''}`}></div>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <Bot size={48} className="text-white" />
                </div>
              </div>

              <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded border transition-colors ${isAiSpeaking ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                isRecording ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  'bg-[#1a1f2e] text-slate-400 border-transparent'
                }`}>
                AI: {isAiSpeaking ? 'Speaking...' : isRecording ? 'Listening...' : interviewState === 'evaluating' ? 'Thinking...' : 'Muted'}
              </div>

              <div className="text-center mt-auto">
                <p className="text-slate-400 text-sm font-semibold mb-2">Question {currentQIndex + 1} of {questions.length}</p>
                <span className={`text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest border 
                ${currentQuestion.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : currentQuestion.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>

            {/* Current Question OR Feedback Panel */}
            {interviewState === 'evaluating' ? (
              /* ---- EVALUATING OVERLAY ---- */
              <div className="bg-[#0b0f19] border border-blue-500/30 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px]">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 animate-ping"></div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center relative z-10">
                    <Loader2 size={36} className="text-white animate-spin" />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Analyzing Your Answer...</h3>
                <p className="text-slate-400 text-sm text-center">Gemini AI is evaluating your response across multiple dimensions.</p>
              </div>
            ) : interviewState !== 'feedback' ? (
              <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">Current Question:</h3>
                  <div className="flex items-center gap-2 text-slate-500">
                    {/* Speaker Button: Read Question Aloud */}
                    <Volume2
                      size={18}
                      className={`cursor-pointer transition-colors ${isAiSpeaking ? 'text-blue-400' : 'hover:text-white'}`}
                      onClick={() => speakQuestion(currentQuestion.text)}
                    />
                    {/* Reset Button: Clear Transcript */}
                    <RotateCcw
                      size={16}
                      className="cursor-pointer hover:text-white"
                      title="Clear Answer"
                      onClick={() => { setTranscript(""); setInterimTranscript(""); }}
                    />
                  </div>
                </div>
                <p className="text-slate-300 text-[15px] leading-relaxed mb-6">
                  {currentQuestion.text}
                </p>

                <div>
                  <h4 className="text-white font-bold text-sm mb-3">Expected Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.topics.map((topic, i) => (
                      <span key={i} className="bg-blue-600/20 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[11px] font-bold">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Feedback Card
              <div className="bg-white rounded-2xl p-6 shadow-xl relative" style={{ animation: 'slideUp 0.4s ease-out' }}>
                <h3 className="text-[#1a1f2e] font-black text-xl mb-2">Previous Answer Score: {evaluation?.overall || 0}/10</h3>
                <p className="text-slate-600 text-sm mb-6">
                  {evaluation?.detailedFeedback || "Review your performance metrics below."}
                </p>

                {/* Score Progress Bars */}
                <div className="grid grid-cols-4 gap-4 mb-6 text-center">
                  {(evaluation?.metrics || []).map((metric, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-slate-400 text-[10px] font-bold uppercase mb-1">{metric.label}</span>
                      <span className={`text-lg font-black ${metric.score >= 8 ? 'text-emerald-500' : metric.score >= 6 ? 'text-blue-500' : 'text-yellow-500'}`}>
                        {metric.score}/10
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-emerald-600 font-bold text-sm">Strengths:</h4>
                    <p className="text-emerald-700/80 text-sm font-medium">{evaluation?.strengths || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-orange-500 font-bold text-sm">Improvements:</h4>
                    <p className="text-orange-600/80 text-sm font-medium">{evaluation?.improvements || "N/A"}</p>
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {currentQIndex < questions.length - 1 ? 'Continue to Next Question' : 'View Final Results'}
                </button>
              </div>
            )}

          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN: USER WEBCAM & INPUT          */}
          {/* ========================================== */}
          <div className="bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl p-6 flex flex-col h-full relative z-10">

            <h2 className="text-white font-bold flex items-center justify-center gap-2 mb-4">
              You
            </h2>

            {/* Webcam Feed Wrapper */}
            <div className="w-full h-[280px] bg-[#05070a] border border-[#1a1f2e] rounded-xl overflow-hidden relative mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraOn ? 'block' : 'hidden'}`}
              />
              {!isCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                  <VideoOff size={48} className="mb-2" />
                  <p className="text-sm font-medium">Camera Disabled</p>
                </div>
              )}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-white">
                Video: {isCameraOn ? 'ON' : 'OFF'}
              </div>
            </div>

            {/* Media Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isCameraOn ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
              >
                {isCameraOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
              </button>
              <button
                onClick={() => {
                  if (isRecording) toggleRecording();
                  setIsMicOn(!isMicOn);
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMicOn ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
            </div>

            {/* Timers */}
            <div className="grid grid-cols-2 gap-4 mb-6 border-b border-[#1a1f2e] pb-6">
              <div className="text-center">
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1">Video On Time</p>
                <p className="text-white font-mono text-lg">{formatTime(timeElapsed)}</p>
              </div>
              <div className="text-center border-l border-[#1a1f2e]">
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1">Total Time</p>
                <p className="text-white font-mono text-lg">{formatTime(timeElapsed)}</p>
              </div>
            </div>

            {/* Editable Transcript Area */}
            <div className="flex-1 flex flex-col mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-300">Your Answer</label>
                <div className="flex items-center gap-3">
                  <select className="bg-[#111624] border border-[#1a1f2e] text-slate-300 text-[11px] rounded px-2 py-1 outline-none">
                    <option>English (US)</option>
                  </select>

                  {/* Voice Recording Toggle Button */}
                  <button
                    onClick={toggleRecording}
                    disabled={!isMicOn || interviewState !== 'answering'}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isRecording
                      ? 'bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                      : 'bg-[#111624] text-slate-400 border border-[#1a1f2e] hover:text-white'
                      }`}
                  >
                    <Mic size={12} /> {isRecording ? 'Listening...' : 'Click to Speak'}
                  </button>
                </div>
              </div>

              {/* The Textarea holds the final text + the currently spoken interim text */}
              <div className="relative w-full flex-1 min-h-[120px]">
                <textarea
                  value={transcript + interimTranscript}
                  onChange={(e) => {
                    // Only allow manual editing when not actively recording to prevent conflicts
                    if (!isRecording) setTranscript(e.target.value);
                  }}
                  placeholder={
                    !window.SpeechRecognition && !window.webkitSpeechRecognition
                      ? "Speech recognition not supported in this browser. Please type here."
                      : "Click 'Click to Speak' or start typing your answer here..."
                  }
                  className={`w-full h-full bg-[#111624] border border-[#1a1f2e] rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 resize-none custom-scrollbar leading-relaxed ${isRecording ? 'text-slate-400 cursor-not-allowed' : 'text-slate-200'}`}
                  readOnly={isRecording}
                ></textarea>

                {/* Recording indicator overlay */}
                {isRecording && (
                  <div className="absolute bottom-3 right-4 flex items-center gap-2">
                    <span className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Panel OR Submit Button */}
            {interviewState === 'answering' ? (
              <div className="space-y-4 mt-auto">
                <div className="bg-white rounded-xl p-4 shadow-lg hidden lg:block">
                  <h4 className="flex items-center gap-2 font-bold text-[#1a1f2e] text-sm mb-3">
                    💡 Interview Tips:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> Speak clearly into your microphone</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> Structure your answer (STAR method)</li>
                    <li className="flex items-center gap-2 text-orange-500"><AlertCircle size={12} /> You can stop recording and edit the text manually</li>
                  </ul>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={transcript.length < 10 && interimTranscript.length < 10}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#1a1f2e] disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                >
                  Submit & Evaluate Answer
                </button>
              </div>
            ) : interviewState === 'evaluating' ? (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center mt-auto" style={{ animation: 'slideUp 0.3s ease-out' }}>
                <Loader2 size={24} className="text-blue-400 animate-spin mx-auto mb-3" />
                <p className="text-blue-400 font-bold text-sm mb-1">AI is evaluating your response...</p>
                <p className="text-slate-500 text-xs">This usually takes 5-10 seconds</p>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center text-emerald-400 text-sm font-semibold mt-auto">
                ✓ Feedback ready — review on the left panel
              </div>
            )}

          </div>
        </main>
      )}

      {/* Embedded CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a3143; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b4256; 
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default MockInterviewPage;