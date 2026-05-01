import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract JWT tokens from URL parameters (sent by backend after OAuth success)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const username = urlParams.get('username');

        if (!accessToken) {
          setError('Authentication failed: No access token received');
          setStatus('error');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Store tokens in localStorage for API calls
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        if (username) {
          localStorage.setItem('username', username);
        }

        setStatus('success');
        setTimeout(() => navigate('/home'), 1000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('An unexpected error occurred during authentication');
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#05070a] font-sans">
      <div className="text-center">
        <div className="bg-[#111724] border border-[#1a1f2e] p-4 rounded-xl shadow-lg shadow-cyan-500/10 inline-block mb-6">
          <Code2 className="w-10 h-10 text-cyan-400 animate-pulse" strokeWidth={2.5} />
        </div>

        {status === 'processing' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">
              Authenticating...
            </h2>
            <p className="text-slate-400 text-sm">
              Please wait while we complete your sign-in
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              ✓ Success!
            </h2>
            <p className="text-slate-400 text-sm">
              Redirecting to homepage...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              ✗ Authentication Failed
            </h2>
            <p className="text-slate-400 text-sm mb-2">
              {error}
            </p>
            <p className="text-slate-500 text-xs">
              Redirecting to login page...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuth2Callback;
