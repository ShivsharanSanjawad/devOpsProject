import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Code2, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import axios from "axios"; // Added axios import
const baseURL = import.meta.env.VITE_BASE_URL;

const Registerpage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  
  // Added state for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        username: username,
        password: password,
        email: email,
        description: "",
        college: college || "Unknown",
        gender: "MALE"
      };

      // API call to the backend
      const response = await axios.post(`${baseURL}/signUp`, payload);

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("username", response.data.username || username);

      // Navigate to dashboard on success
      navigate("/home");
    } catch (err) {
      console.error("Registration error:", err);
      const data = err.response?.data;
      setError(
        data?.error || data?.message || "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#05070a] font-sans">
      {/* LEFT SECTION - 3D Animation */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-[#060812] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#121631] via-[#090b16] to-[#040509]">
        {/* Ambient glow behind spline */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        
        <div
          className="absolute inset-0 z-10"
          style={{ transform: "scale(1.9)", transformOrigin: "center" }}
        >
          {/* You can swap this URL with a different Spline scene for the register page if you want variety */}
          <Spline scene="https://prod.spline.design/vi-h88jX1pGoyilb/scene.splinecode" />
        </div>
      </div>

      {/* RIGHT SECTION - Register Form */}
      <div className="flex flex-1 justify-center items-center px-6 py-12 relative z-20">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex md:hidden justify-center mb-8">
            <div className="bg-[#111724] border border-[#1a1f2e] p-4 rounded-xl shadow-lg shadow-purple-500/10">
              <Code2 className="w-8 h-8 text-purple-400" strokeWidth={2.5} />
            </div>
          </div>

          <div className="bg-[#0b0f19] rounded-2xl shadow-2xl p-8 md:p-10 border border-[#1a1f2e]">
            <h2 className="text-2xl md:text-2xl font-black text-white text-center mb-2 uppercase tracking-wide font-display">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">Arena</span>
            </h2>

            <p className="text-slate-400 text-center mb-8 text-sm">
              Create your gladiator profile to start competing
            </p>

            {/* Error Message Display */}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* USERNAME */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Gladiator Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="e.g. CyberNinja_99"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#05070a] border border-[#1a1f2e] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-slate-600 text-sm"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="gladiator@codearena.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#05070a] border border-[#1a1f2e] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-slate-600 text-sm"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a strong password"
                    className="w-full pl-12 pr-12 py-3.5 bg-[#05070a] border border-[#1a1f2e] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-slate-600 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* COLLEGE */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  College / Organization
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. MIT, Stanford (optional)"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#05070a] border border-[#1a1f2e] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-slate-600 text-sm"
                  />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start text-sm mt-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 mt-0.5 rounded bg-[#05070a] border-[#1a1f2e] text-purple-500 focus:ring-purple-500 focus:ring-offset-[#0b0f19] cursor-pointer"
                  />
                  <span className="text-slate-400 text-xs leading-relaxed">
                    I agree to the{" "}
                    <a href="#" className="text-purple-400 hover:text-purple-300 hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-purple-400 hover:text-purple-300 hover:underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="font-display w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(147,51,234,0.15)] transition-all transform hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(147,51,234,0.25)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? "Forging Account..." : "Create Account"}
              </button>
            </form>

            {/* FOOTER */}
            <div className="mt-8 pt-6 border-t border-[#1a1f2e]">
              <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <a
                  href="/login" // Assuming this maps to your Loginpage route
                  className="text-white font-bold hover:text-purple-400 hover:underline transition-colors"
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registerpage;