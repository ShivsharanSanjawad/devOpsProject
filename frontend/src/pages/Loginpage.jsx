import React, { useState } from "react";
// Swapped 'Mail' for 'User' since the API expects a username
import { User, Lock, Eye, EyeOff, Code2 } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import axios from "axios"; // Added axios import
const baseURL = import.meta.env.VITE_BASE_URL;

const oauthEnabled = import.meta.env.VITE_OAUTH_ENABLED === 'true';

const Loginpage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Constructing the payload exactly as shown in Postman
      const payload = {
        username: username,
        password: password
      };

      // API call to the backend
      const response = await axios.post(`${baseURL}/login`, payload);

      // Save the returned tokens to localStorage for future authenticated requests
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("username", response.data.username);

      // Navigate to home on success
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      const data = err.response?.data;
      setError(
        data?.error || data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to backend OAuth2 Google endpoint (OAuth2 is at root level, not /api)
    const backendBaseURL = baseURL.replace('/api', '');
    window.location.href = `${backendBaseURL}/oauth2/authorization/google`;
  };

  return (
    <div className="h-screen w-full flex bg-[#05070a] font-sans overflow-hidden">
      {/* LEFT SECTION - 3D Animation */}
      <div className="hidden md:flex flex-1 relative bg-[#060812] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#121631] via-[#090b16] to-[#040509]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        
        <div
          className="absolute inset-0 z-10"
          style={{ transform: "scale(1.9)", transformOrigin: "center" }}
        >
          <Spline scene="https://prod.spline.design/vi-h88jX1pGoyilb/scene.splinecode" />
        </div>
      </div>

      {/* RIGHT SECTION - Login Form */}
      <div className="flex flex-1 justify-center items-center px-6 py-4 bg-[#05070a] relative z-20 overflow-y-auto md:overflow-hidden">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex md:hidden justify-center mb-6">
            <div className="bg-[#111724] border border-[#1a1f2e] p-3 rounded-xl shadow-lg shadow-cyan-500/10">
              <Code2 className="w-7 h-7 text-cyan-400" strokeWidth={2.5} />
            </div>
          </div>

          <div className="bg-[#0b0f19] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#1a1f2e]">

            <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-1 uppercase tracking-wide font-display">
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">Back</span>
            </h2>

            <p className="text-slate-400 text-center mb-6 text-sm">
              Enter your credentials to access the arena
            </p>

            {/* Error Message Display */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>

              {/* USERNAME */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-3 bg-[#05070a] border border-[#1a1f2e] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder-slate-600 text-sm"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3 bg-[#05070a] border border-[#1a1f2e] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder-slate-600 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="font-display w-full mt-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </button>

            </form>

            {oauthEnabled && (
              <>
                {/* DIVIDER */}
                <div className="relative mt-6 mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1a1f2e]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-[#0b0f19] text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* GOOGLE SIGN IN BUTTON */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-[#05070a] border border-[#1a1f2e] hover:bg-[#111724] hover:border-[#2a3143] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.076 7.076 0 01-6.723-4.806L1.24 17.35C3.198 21.302 7.269 24 12 24c3.24 0 6.136-1.145 8.358-3.04l-4.318-2.947z"/>
                    <path fill="#4A90E2" d="M19.834 20.96C21.2 19.336 22 17.155 22 14.636c0-1.014-.11-1.99-.304-2.927H12v5.454h5.834z"/>
                    <path fill="#FBBC05" d="M5.266 14.235A7.03 7.03 0 014.909 12c0-.773.136-1.518.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.35l4.029-3.115z"/>
                  </svg>
                  Google
                </button>
              </>
            )}

            {/* FOOTER */}
            <div className="mt-6 pt-5 border-t border-[#1a1f2e]">
              <p className="text-center text-sm text-slate-400">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-white font-bold hover:text-cyan-400 hover:underline transition-colors"
                >
                  Sign Up
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;