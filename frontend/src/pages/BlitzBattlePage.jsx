import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from "@monaco-editor/react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import {
    Swords, Copy, Check, ArrowRight, Loader2, Clock, Trophy,
    Code2, CloudUpload, ChevronDown, AlertTriangle, XCircle,
    CheckCircle2, Shield, Zap, Users, ArrowLeft, Skull, Terminal,
    ShieldAlert
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_BASE_URL;
const WS_URL = API_BASE?.replace('/api', '') + '/ws';

const languageTemplates = {
    python: `# Read input from stdin using input()\n# Print output to stdout using print()\n\n`,
    cpp: `#include <iostream>\nusing namespace std;\n\n// Read input from stdin (cin) and print output to stdout (cout)\nint main(){\n    \n    return 0;\n}`,
    java: `import java.util.*;\n\n// Class name must be Solution\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read input from stdin and print output to stdout\n        \n    }\n}`
};

const getVerdictInfo = (status) => {
    switch (status) {
        case 'AC': return { text: 'Accepted', color: 'text-emerald-400', icon: <CheckCircle2 size={16} /> };
        case 'WA': return { text: 'Wrong Answer', color: 'text-red-400', icon: <XCircle size={16} /> };
        case 'TLE': return { text: 'Time Limit Exceeded', color: 'text-orange-400', icon: <Clock size={16} /> };
        case 'MLE': return { text: 'Memory Limit', color: 'text-yellow-400', icon: <AlertTriangle size={16} /> };
        case 'RE': return { text: 'Runtime Error', color: 'text-rose-400', icon: <AlertTriangle size={16} /> };
        case 'CE': return { text: 'Compile Error', color: 'text-pink-400', icon: <Code2 size={16} /> };
        case 'PENDING':
        case 'RUNNING': return { text: 'Judging...', color: 'text-cyan-400', icon: <Loader2 className="animate-spin" size={16} /> };
        default: return { text: status || '—', color: 'text-slate-500', icon: null };
    }
};

const BlitzBattlePage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const headers = { Authorization: `Bearer ${token}` };

    // === STATE ===
    const [phase, setPhase] = useState('lobby'); // lobby | waiting | countdown | battle | result
    const [partyCode, setPartyCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [battle, setBattle] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(languageTemplates.python);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myVerdict, setMyVerdict] = useState(null);
    const [opponentVerdict, setOpponentVerdict] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [showOutput, setShowOutput] = useState(false);

    const stompRef = useRef(null);
    const timerRef = useRef(null);
    const battleRef = useRef(null);
    const pollRef = useRef(null);

    // Keep ref in sync
    useEffect(() => { battleRef.current = battle; }, [battle]);

    // Get current username from token
    const getMyUsername = useCallback(() => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub;
        } catch { return null; }
    }, [token]);

    // === Helper: process incoming battle data (from WS or poll) ===
    const processBattleUpdate = useCallback((data) => {
        setBattle(data);

        const me = getMyUsername();
        const amP1 = data.player1?.username === me;

        // Update verdicts
        if (data.player1Verdict) {
            if (amP1) setMyVerdict(data.player1Verdict);
            else setOpponentVerdict(data.player1Verdict);
        }
        if (data.player2Verdict) {
            if (!amP1) setMyVerdict(data.player2Verdict);
            else setOpponentVerdict(data.player2Verdict);
        }

        // Phase transitions
        if (data.status === 'IN_PROGRESS' && !battleRef.current?.startedAt) {
            setPhase('countdown');
            // Keep polling active — it's our fallback if WebSocket drops
        }
        if (data.status === 'COMPLETED') {
            setPhase('result');
            if (timerRef.current) clearInterval(timerRef.current);
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }
        if (data.status === 'CANCELLED') {
            setError('Room was cancelled');
            setPhase('lobby');
            if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        }
    }, [getMyUsername]);

    // === Polling fallback: continuously poll battle state ===
    const startPolling = useCallback((battleId) => {
        if (pollRef.current) return;
        pollRef.current = setInterval(async () => {
            try {
                const res = await axios.get(`${API_BASE}/battle/${battleId}`, { headers });
                processBattleUpdate(res.data);
            } catch (err) {
                console.warn('Poll error:', err.message);
            }
        }, 2000);
    }, [headers, processBattleUpdate]);

    // === WEBSOCKET ===
    const connectWS = useCallback((battleId) => {
        if (stompRef.current) return;

        // Always start polling as a reliable fallback
        startPolling(battleId);

        try {
            const client = new Client({
                webSocketFactory: () => new SockJS(WS_URL),
                reconnectDelay: 3000,
                debug: (str) => console.log('[STOMP]', str),
                onConnect: () => {
                    console.log('[STOMP] Connected!');
                    client.subscribe(`/topic/battle/${battleId}`, (msg) => {
                        const data = JSON.parse(msg.body);
                        processBattleUpdate(data);
                    });
                },
                onStompError: (frame) => {
                    console.error('[STOMP] Error:', frame.headers?.message);
                },
                onWebSocketError: (evt) => {
                    console.warn('[STOMP] WebSocket error, polling is active as fallback');
                },
                onDisconnect: () => {
                    console.log('[STOMP] Disconnected');
                }
            });

            client.activate();
            stompRef.current = client;
        } catch (err) {
            console.warn('[STOMP] Failed to create client, relying on polling:', err.message);
        }
    }, [processBattleUpdate, startPolling]);

    // Cleanup WS + polling on unmount
    useEffect(() => {
        return () => {
            if (stompRef.current) stompRef.current.deactivate();
            if (timerRef.current) clearInterval(timerRef.current);
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    // === COUNTDOWN → BATTLE ===
    useEffect(() => {
        if (phase !== 'countdown') return;
        setCountdown(5);
        const iv = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(iv);
                    setPhase('battle');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(iv);
    }, [phase]);

    // === BATTLE TIMER ===
    useEffect(() => {
        if (phase !== 'battle') return;
        setElapsed(0);
        timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase]);

    // === ACTIONS ===
    const createRoom = async () => {
        setError('');
        try {
            const res = await axios.post(`${API_BASE}/battle/create`, {}, { headers });
            const data = res.data;
            setPartyCode(data.partyCode);
            setBattle(data);
            setPhase('waiting');
            connectWS(data.id);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create room');
        }
    };

    const joinRoom = async () => {
        setError('');
        if (!joinCode.trim()) { setError('Enter a party code'); return; }
        try {
            const res = await axios.post(`${API_BASE}/battle/join`, { partyCode: joinCode.toUpperCase() }, { headers });
            const data = res.data;
            setBattle(data);
            setPartyCode(data.partyCode);
            connectWS(data.id);
            setPhase('countdown');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Room not found or already started');
        }
    };

    const cancelRoom = async () => {
        try {
            await axios.delete(`${API_BASE}/battle/${partyCode}`, { headers });
        } catch { /* ignore */ }
        setPhase('lobby');
        setPartyCode('');
        setBattle(null);
        if (stompRef.current) { stompRef.current.deactivate(); stompRef.current = null; }
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(partyCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        setCode(languageTemplates[lang]);
    };

    const handleSubmit = async () => {
        if (!code.trim() || isSubmitting || !battle?.problemId) return;
        setIsSubmitting(true);
        setMyVerdict('PENDING');
        setSubmissionResult({ status: 'PENDING' });
        setShowOutput(true);

        try {
            const postRes = await axios.post(`${API_BASE}/submissions`, {
                problemId: battle.problemId,
                language,
                code
            }, { headers });

            const { submissionId } = postRes.data;

            // Poll for verdict
            let judged = false;
            let finalStatus = null;
            while (!judged) {
                await new Promise(r => setTimeout(r, 1500));
                const getRes = await axios.get(`${API_BASE}/submissions/${submissionId}`, { headers });
                const st = getRes.data.status;
                setMyVerdict(st);
                setSubmissionResult(getRes.data);
                if (st !== 'PENDING' && st !== 'RUNNING') {
                    judged = true;
                    finalStatus = st;
                }
            }

            // After judging completes, fetch latest battle state so result page shows
            // (handles case where WebSocket missed the COMPLETED update)
            if (finalStatus && battleRef.current?.id) {
                try {
                    const battleRes = await axios.get(`${API_BASE}/battle/${battleRef.current.id}`, { headers });
                    processBattleUpdate(battleRes.data);
                } catch (e) {
                    console.warn('Battle refresh after submit failed:', e.message);
                }
            }
        } catch (err) {
            console.error('Submit error:', err);
            setMyVerdict('ERROR');
            setSubmissionResult({ status: 'ERROR', compileError: err.response?.data?.message || 'Network or server error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const myUsername = getMyUsername();
    const amP1 = battle?.player1?.username === myUsername;
    const opponent = amP1 ? battle?.player2 : battle?.player1;
    const me = amP1 ? battle?.player1 : battle?.player2;
    const iWon = battle?.winnerUsername === myUsername;

    // ===========================
    //         RENDER
    // ===========================

    // --- LOBBY ---
    if (phase === 'lobby') {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="p-3 bg-purple-600 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                                <Swords className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
                            1v1 BLITZ BATTLE
                        </h1>
                        <p className="text-gray-400">Challenge a friend to a coding duel</p>
                    </div>

                    {/* Create Room */}
                    <div className="bg-[#111128] border border-purple-600/30 rounded-2xl p-6 mb-4">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-400" /> Create Room
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">Generate a party code and share it with your opponent.</p>
                        <button
                            onClick={createRoom}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold tracking-wide uppercase transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5" /> Create Battle Room
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-700" />
                        <span className="text-gray-500 text-sm font-medium uppercase">or</span>
                        <div className="flex-1 h-px bg-gray-700" />
                    </div>

                    {/* Join Room */}
                    <div className="bg-[#111128] border border-cyan-600/30 rounded-2xl p-6">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Users className="w-5 h-5 text-cyan-400" /> Join Room
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">Enter your friend&apos;s party code to join the battle.</p>
                        <div className="flex gap-3">
                            <input
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE"
                                maxLength={6}
                                className="flex-1 bg-[#0a0a1a] border border-gray-700 rounded-xl px-4 py-3 text-white text-center font-mono text-lg tracking-[0.3em] uppercase placeholder:text-gray-600 focus:outline-none focus:border-cyan-500"
                            />
                            <button
                                onClick={joinRoom}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                            >
                                Join <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={() => navigate('/games')}
                        className="mt-6 w-full py-2 text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Games
                    </button>
                </div>
            </div>
        );
    }

    // --- WAITING ROOM ---
    if (phase === 'waiting') {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
                <div className="text-center max-w-md w-full">
                    <div className="mb-8">
                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Waiting for Opponent</h2>
                        <p className="text-gray-400">Share this code with your friend</p>
                    </div>

                    {/* Party Code Display */}
                    <div className="bg-[#111128] border border-purple-600/40 rounded-2xl p-8 mb-6">
                        <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Party Code</p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-5xl font-mono font-bold text-purple-400 tracking-[0.4em]">
                                {partyCode}
                            </span>
                            <button
                                onClick={copyCode}
                                className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg transition-colors"
                                title="Copy code"
                            >
                                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-purple-400" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-6">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        Room is active · Waiting for player 2
                    </div>

                    <button
                        onClick={cancelRoom}
                        className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors text-sm"
                    >
                        Cancel Room
                    </button>
                </div>
            </div>
        );
    }

    // --- COUNTDOWN ---
    if (phase === 'countdown') {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Opponent Found!</h2>
                    <div className="flex items-center justify-center gap-6 my-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-600/40 flex items-center justify-center mx-auto mb-2">
                                <span className="text-2xl font-bold text-purple-400">
                                    {(me?.username || '?')[0].toUpperCase()}
                                </span>
                            </div>
                            <p className="text-white font-semibold text-sm">{me?.username || 'You'}</p>
                            <p className="text-gray-500 text-xs">Rating: {me?.rating || 0}</p>
                        </div>
                        <div className="text-3xl font-bold text-gray-500">VS</div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 border border-cyan-600/40 flex items-center justify-center mx-auto mb-2">
                                <span className="text-2xl font-bold text-cyan-400">
                                    {(opponent?.username || '?')[0].toUpperCase()}
                                </span>
                            </div>
                            <p className="text-white font-semibold text-sm">{opponent?.username || 'Opponent'}</p>
                            <p className="text-gray-500 text-xs">Rating: {opponent?.rating || 0}</p>
                        </div>
                    </div>
                    <div className="text-8xl font-bold text-purple-400 animate-pulse my-8">
                        {countdown}
                    </div>
                    <p className="text-gray-400 text-sm">Battle starting...</p>
                </div>
            </div>
        );
    }

    // --- RESULT ---
    if (phase === 'result') {
        return (
            <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
                <div className="text-center max-w-md w-full">
                    <div className="mb-6">
                        {iWon ? (
                            <>
                                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-yellow-400 mb-2">VICTORY!</h2>
                                <p className="text-gray-400">You were the first to solve it. GG!</p>
                            </>
                        ) : (
                            <>
                                <Skull className="w-16 h-16 text-red-400 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-red-400 mb-2">DEFEAT</h2>
                                <p className="text-gray-400">{battle?.winnerUsername} solved it first. Better luck next time!</p>
                            </>
                        )}
                    </div>

                    <div className="bg-[#111128] border border-gray-700 rounded-2xl p-6 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-gray-400 text-xs uppercase mb-1">You</p>
                                <p className="text-white font-bold">{me?.username}</p>
                                {myVerdict && (
                                    <span className={`text-sm ${getVerdictInfo(myVerdict).color}`}>
                                        {getVerdictInfo(myVerdict).text}
                                    </span>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400 text-xs uppercase mb-1">Opponent</p>
                                <p className="text-white font-bold">{opponent?.username}</p>
                                {opponentVerdict && (
                                    <span className={`text-sm ${getVerdictInfo(opponentVerdict).color}`}>
                                        {getVerdictInfo(opponentVerdict).text}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-gray-500 text-xs">Problem: {battle?.problemTitle}</p>
                            <p className="text-gray-500 text-xs">Time: {formatTime(elapsed)}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => { setPhase('lobby'); setBattle(null); setPartyCode(''); setMyVerdict(null); setOpponentVerdict(null); setSubmissionResult(null); setShowOutput(false); if (stompRef.current) { stompRef.current.deactivate(); stompRef.current = null; } if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } }}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={() => navigate('/games')}
                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all"
                        >
                            Back to Games
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- BATTLE ARENA ---
    return (
        <div className="h-screen bg-[#0a0a1a] flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d24] border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <Swords className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-bold text-sm">1v1 BLITZ</span>
                    <span className="text-gray-500 text-xs">Room: {partyCode}</span>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 px-3 py-1 bg-[#111128] rounded-lg border border-gray-700">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-mono font-bold text-sm">{formatTime(elapsed)}</span>
                </div>

                {/* Player Status */}
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-white">{me?.username || 'You'}</span>
                        {myVerdict && (
                            <span className={`flex items-center gap-1 ${getVerdictInfo(myVerdict).color}`}>
                                {getVerdictInfo(myVerdict).icon}
                                <span className="text-xs">{getVerdictInfo(myVerdict).text}</span>
                            </span>
                        )}
                    </div>
                    <span className="text-gray-600">vs</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span className="text-white">{opponent?.username || 'Opponent'}</span>
                        {opponentVerdict && (
                            <span className={`flex items-center gap-1 ${getVerdictInfo(opponentVerdict).color}`}>
                                {getVerdictInfo(opponentVerdict).icon}
                                <span className="text-xs">{getVerdictInfo(opponentVerdict).text}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content: Problem + Editor */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Problem Description */}
                <div className="w-[40%] border-r border-gray-800 overflow-y-auto p-6">
                    <div className="mb-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${battle?.problemDifficulty === 'EASY' ? 'bg-emerald-500/20 text-emerald-400' :
                            battle?.problemDifficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {battle?.problemDifficulty || 'UNKNOWN'}
                        </span>
                        <span className="text-gray-500 text-xs ml-3">
                            Time: {battle?.timeLimitMs || 2000}ms · Memory: {battle?.memoryLimitMb || 256}MB
                        </span>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-4">{battle?.problemTitle || 'Loading...'}</h1>
                    <div
                        className="text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none"
                        style={{ whiteSpace: 'pre-wrap' }}
                    >
                        {battle?.problemBody || 'Problem description loading...'}
                    </div>
                </div>

                {/* RIGHT: Code Editor + Controls */}
                <div className="flex-1 flex flex-col">
                    {/* Editor Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d24] border-b border-gray-800">
                        <div className="relative">
                            <select
                                value={language}
                                onChange={e => handleLanguageChange(e.target.value)}
                                className="appearance-none bg-[#111128] border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-semibold text-sm transition-all ${isSubmitting
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                }`}
                        >
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
                            {isSubmitting ? 'Judging...' : 'Submit'}
                        </button>
                    </div>

                    {/* Monaco Editor */}
                    <div className={showOutput ? 'flex-1 min-h-0' : 'flex-1'}>
                        <Editor
                            height="100%"
                            language={language === 'cpp' ? 'cpp' : language}
                            value={code}
                            onChange={val => setCode(val || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                padding: { top: 12 },
                                smoothScrolling: true,
                                cursorBlinking: 'smooth',
                            }}
                        />
                    </div>

                    {/* Output / Result Panel */}
                    {showOutput && submissionResult && (
                        <div className="h-[180px] border-t border-gray-800 bg-[#0b0d1a] flex flex-col shrink-0">
                            <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-800">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                    <Terminal size={13} className="text-cyan-400" />
                                    <span>Output</span>
                                </div>
                                <button
                                    onClick={() => setShowOutput(false)}
                                    className="text-gray-500 hover:text-white text-xs px-2 py-0.5 rounded transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {/* Verdict Banner */}
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${submissionResult.status === 'AC' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                    submissionResult.status === 'WA' ? 'bg-red-500/10 border-red-500/30' :
                                        submissionResult.status === 'TLE' ? 'bg-orange-500/10 border-orange-500/30' :
                                            submissionResult.status === 'CE' ? 'bg-pink-500/10 border-pink-500/30' :
                                                submissionResult.status === 'RE' ? 'bg-rose-500/10 border-rose-500/30' :
                                                    submissionResult.status === 'MLE' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                                        'bg-cyan-500/10 border-cyan-500/30'
                                    }`}>
                                    <span className={getVerdictInfo(submissionResult.status).color}>
                                        {getVerdictInfo(submissionResult.status).icon}
                                    </span>
                                    <span className={`font-bold text-sm ${getVerdictInfo(submissionResult.status).color}`}>
                                        {getVerdictInfo(submissionResult.status).text}
                                    </span>
                                </div>

                                {/* Runtime & Memory Stats */}
                                {submissionResult.status !== 'PENDING' && submissionResult.status !== 'RUNNING' &&
                                    submissionResult.status !== 'CE' && submissionResult.status !== 'ERROR' && (
                                        <div className="flex gap-6 text-xs">
                                            <div>
                                                <span className="text-gray-500 font-semibold uppercase tracking-wider">Runtime </span>
                                                <span className="text-gray-300 font-mono">{submissionResult.timeMs ?? 0} ms</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 font-semibold uppercase tracking-wider">Memory </span>
                                                <span className="text-gray-300 font-mono">{submissionResult.memoryKb ?? 0} KB</span>
                                            </div>
                                        </div>
                                    )}

                                {/* Compile Error */}
                                {submissionResult.compileError && (
                                    <div>
                                        <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider mb-1">Compiler Output</p>
                                        <pre className="bg-pink-500/5 border border-pink-500/20 text-pink-200/80 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                                            {submissionResult.compileError}
                                        </pre>
                                    </div>
                                )}

                                {/* Test Case Details */}
                                {submissionResult.verdictDetail && (() => {
                                    try {
                                        const cases = JSON.parse(submissionResult.verdictDetail);
                                        return (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Test Cases</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {cases.map((tc, i) => (
                                                        <span
                                                            key={i}
                                                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${tc.verdict === 'AC'
                                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                                                }`}
                                                        >
                                                            #{i + 1} {tc.verdict}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    } catch { return null; }
                                })()}

                                {/* Auto Plagiarism Result */}
                                {submissionResult.plagiarismVerdict && (
                                    <div className="border-t border-gray-800 pt-3">
                                        <div className={`rounded-lg border p-3 space-y-2 ${submissionResult.plagiarismVerdict === 'LIKELY_ORIGINAL' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                            submissionResult.plagiarismVerdict === 'SUSPICIOUS' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                                'bg-red-500/5 border-red-500/20'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                <ShieldAlert size={12} className={submissionResult.plagiarismVerdict === 'LIKELY_ORIGINAL' ? 'text-emerald-400' : submissionResult.plagiarismVerdict === 'SUSPICIOUS' ? 'text-yellow-400' : 'text-red-400'} />
                                                <span className={`text-xs font-bold ${submissionResult.plagiarismVerdict === 'LIKELY_ORIGINAL' ? 'text-emerald-400' :
                                                    submissionResult.plagiarismVerdict === 'SUSPICIOUS' ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                    {submissionResult.plagiarismVerdict.replace(/_/g, ' ')}
                                                </span>
                                                {submissionResult.plagiarismPenalty && (
                                                    <span className="ml-auto text-red-400 text-[10px] font-bold uppercase bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">Penalty</span>
                                                )}
                                            </div>

                                            {submissionResult.originalityScore != null && (
                                                <div className="flex gap-4 text-[11px]">
                                                    <span className="text-gray-500">Originality <span className="text-gray-200 font-mono font-bold">{submissionResult.originalityScore}%</span></span>
                                                    <span className="text-gray-500">AI Likelihood <span className="text-gray-200 font-mono font-bold">{submissionResult.aiLikelihood}%</span></span>
                                                </div>
                                            )}

                                            {submissionResult.originalityScore != null && (
                                                <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                    <div className={`h-1.5 rounded-full transition-all ${submissionResult.originalityScore >= 70 ? 'bg-emerald-500' :
                                                        submissionResult.originalityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`} style={{ width: `${submissionResult.originalityScore}%` }} />
                                                </div>
                                            )}

                                            {submissionResult.plagiarismExplanation && (
                                                <p className="text-gray-400 text-[11px] leading-relaxed">{submissionResult.plagiarismExplanation}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlitzBattlePage;
