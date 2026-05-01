import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Gamepad2, 
  Dumbbell, 
  Trophy, 
  Joystick, 
  BookOpen, 
  Briefcase, 
  Users,
  LogOut 
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Gladiator");

  // Fetch the username from localStorage when the Navbar mounts
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Define navigation links to easily map through them
  const navLinks = [
    { name: 'Arena', path: '/home', icon: Gamepad2 },
    { name: 'Practice', path: '/practice', icon: Dumbbell },
    { name: 'Contest', path: '/contests', icon: Trophy },
    { name: 'Games', path: '/games', icon: Joystick }, 
    { name: 'Interview', path: '/interview', icon: Briefcase },
    { name: 'Community', path: '/community', icon: Users },
  ];

  return (
    <nav className="w-full h-[72px] bg-[#0b0f19] border-b border-[#1a1f2e] flex items-center justify-between px-4 lg:px-8 font-sans sticky top-0 z-50">
      
      {/* 1. Left Section - Logo */}
      <Link to="/home" className="flex items-center gap-3 cursor-pointer shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Code2 size={20} className="text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-black tracking-tight font-display uppercase flex items-center">
          <span className="text-white">CODE</span>
          <span className="text-cyan-400">ARENA</span>
        </h1>
      </Link>

      {/* 2. Middle Section - Navigation Links */}
      <div className="hidden lg:flex items-center gap-1 xl:gap-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 xl:px-4 py-2 rounded-xl text-sm transition-all group ${
                  isActive 
                    ? "bg-[#1e2536] border border-[#2a3143] text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                    : "border border-transparent text-slate-400 hover:text-white hover:bg-[#111724] font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={16} 
                    className={isActive ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300 transition-colors"} 
                    fill={isActive ? "currentColor" : "none"} 
                    fillOpacity={isActive ? 0.2 : 1} 
                  />
                  {link.name}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* 3. Right Section - Profile & Logout */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* User Profile */}
        <Link to="/profile" className="flex items-center gap-3 cursor-pointer group">
          {/* Text Info */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors">
              {username}
            </span>
          </div>
          
          {/* Avatar with Status Ring & Dot */}
          <div className="relative">
            <img 
              src={`https://ui-avatars.com/api/?name=${username}&background=1a1f2e&color=38bdf8`} 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500 p-[2px] bg-[#0b0f19]"
            />
            {/* Online Status Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0b0f19] rounded-full"></span>
          </div>
        </Link>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('username');
            navigate('/login');
          }}
          className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors px-2 py-2 rounded-lg hover:bg-red-500/10"
          title="Sign out"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Logout</span>
        </button>

      </div>
    </nav>
  );
};

export default Navbar;