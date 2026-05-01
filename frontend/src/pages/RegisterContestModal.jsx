import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Zap, AlertTriangle, X } from 'lucide-react';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api';

const RegisterContestModal = ({ isOpen, onClose, onSuccess, contestId, contestTitle }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsRegistered(false);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegister = async () => {
    if (!contestId) {
      setError('Contest ID missing.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${baseURL}/contests/${contestId}/register`, {}, { headers });

      setIsRegistered(true);
      if (onSuccess) onSuccess(contestId);
    } catch (err) {
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to register for contest.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Dark Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-[#05070a]/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-[#0b0f19] border border-[#1a1f2e] rounded-2xl w-full max-w-[420px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10 font-sans overflow-hidden transform transition-all">
        
        {/* Ambient Top Glow */}
        <div className={`absolute -top-20 -right-20 w-56 h-56 rounded-full blur-[80px] pointer-events-none transition-colors duration-700 ${isRegistered ? 'bg-emerald-600/20' : 'bg-purple-600/20'}`}></div>

        {/* Close Button (Only show on Step 1) */}
        {!isRegistered && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white bg-[#111624] hover:bg-[#1a1f2e] p-1.5 rounded-lg transition-colors z-20"
          >
            <X size={18} />
          </button>
        )}

        {!isRegistered ? (
          /* --- STEP 1: CONFIRMATION PROMPT --- */
          <div className="animate-in fade-in zoom-in-95 duration-300 relative z-10">
            
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Zap size={24} className="text-purple-400 fill-purple-400/20" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
              Enter the Arena
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              You are about to register for <span className="text-white font-semibold">{contestTitle || 'this contest'}</span>. Prepare your IDE and review the rules before the countdown ends.
            </p>

            {/* Warning Box */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3.5 flex items-start gap-3 mb-8">
              <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-yellow-500/90 text-xs font-medium leading-relaxed">
                If you can't participate, please unregister before the contest begins to ensure your <span className="text-yellow-400 font-bold">global rating stays safe</span>.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-slate-300 bg-[#111624] border border-[#1a1f2e] hover:bg-[#1a1f2e] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={isSubmitting}
                className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-xs mt-4">{error}</p>
            )}
          </div>
        ) : (
          /* --- STEP 2: SUCCESS STATE --- */
          <div className="animate-in fade-in zoom-in-95 duration-500 relative z-10 flex flex-col items-center text-center pt-4 pb-2">
            
            {/* Pulsing Success Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Check size={32} strokeWidth={3} className="text-emerald-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Registration Confirmed!
            </h2>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-[280px]">
              You're all set for the contest. Your slot is secured. Good luck and may the best coder win! 💪
            </p>
            
            <button
              onClick={onClose}
              className="w-full bg-emerald-500/10 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white text-emerald-400 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95"
            >
              Back to Contests
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default RegisterContestModal;