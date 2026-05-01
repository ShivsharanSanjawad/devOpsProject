import React from 'react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section id="cta" className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 overflow-hidden font-sans bg-[#060812] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#121631] via-[#090b16] to-[#040509]">
      
      {/* Background Ambient Glow around the text */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>

      <div className="relative z-10 max-w-3xl w-full flex flex-col items-center text-center">
        
        {/* Heading Section */}
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[1.1] mb-6 flex flex-col items-center">
          <span className="text-white mb-2">Ready To</span>
          
          {/* Glowing Container for bottom lines */}
          <div className="relative inline-block px-5 py-2 font-display">
            
            {/* Top glowing line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-400 via-purple-500 to-purple-600 shadow-[0_0_8px_#22d3ee]"></div>
            
            {/* Top Left Vertical Tick */}
            <div className="absolute top-0 left-0 w-[1px] h-3 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
            
            {/* Top Right Vertical Tick */}
            <div className="absolute top-0 right-0 w-[1px] h-3 bg-purple-600 shadow-[0_0_8px_#9333ea]"></div>

            {/* Glowing Text Content */}
            <div className="relative">
              {/* Blurred backdrop for ambient glow */}
              <span className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                DOMINATE THE<br/>ARENA?
              </span>
              
              {/* Crisp foreground text */}
              <span className="relative text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-500 block">
                DOMINATE THE
              </span>
              <span className="relative text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-500 block">
                ARENA?
              </span>
            </div>

            {/* Bottom glowing line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-400 via-purple-500 to-purple-600 shadow-[0_0_8px_#9333ea]"></div>
            
            {/* Bottom Left Vertical Tick */}
            <div className="absolute bottom-0 left-0 w-[1px] h-3 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
            
            {/* Bottom Right Vertical Tick */}
            <div className="absolute bottom-0 right-0 w-[1px] h-3 bg-purple-600 shadow-[0_0_8px_#9333ea]"></div>
          </div>
        </h2>

        {/* Subtext */}
        <p className="text-slate-400 text-sm md:text-base max-w-lg mb-10 leading-relaxed font-medium">
          Join thousands of developers competing daily. Prove your skills, climb the ranks, and get recognized by top tech companies.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          
          {/* Primary Button with Cut Corners */}
          <button 
            onClick={() => navigate('/register')}
            style={{ 
              clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' 
            }}
            className="w-full sm:w-auto bg-white text-black font-bold uppercase tracking-wider text-sm px-10 py-4 hover:bg-gray-200 transition-colors duration-300"
          >
            Create Account
          </button>

          {/* Secondary Outline Button */}
          <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-transparent border border-[#2d3342] text-white font-bold uppercase tracking-wider text-sm px-10 py-4 hover:bg-[#1a1f2e] transition-colors duration-300">
            Join Live Contest
          </button>
          
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-[#525964] text-xs font-medium">
          No credit card required. Free for students.
        </p>
        
      </div>
    </section>
  );
};

export default CTASection;