import { Code2, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-[#050816] via-[#0b1020] to-[#061a1f] text-white overflow-hidden">
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:40px_40px]" />

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo + Description */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500">
                <Code2 size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-widest font-display">
                <span className="text-white">CODE</span>
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  ARENA
                </span>
              </h1>
            </div>

            <p className="text-gray-400 text-sm hidden sm:block">
              The competitive programming arena. Train, battle, and win.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
              <Github size={18} />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} CodeArena. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}