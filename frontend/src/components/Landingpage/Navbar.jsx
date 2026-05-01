import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const navItems = ["features", "modes", "leaderboard"];

  // Smooth scroll (Landing page only)
  const handleScrollTo = (id) => {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      navItems.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const offset = section.offsetTop - 120;
          const height = section.offsetHeight;

          if (
            window.scrollY >= offset &&
            window.scrollY < offset + height
          ) {
            setActive(id);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-lg border-b transition-all duration-300 ${
        scrolled
          ? "bg-[#0b1020]/95 border-white/10 shadow-lg"
          : "bg-[#0b1020]/70 border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg shadow-cyan-500/20">
            <Code2 className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-widest">
            <span className="text-white font-display">CODE</span>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-display">
              ARENA
            </span>
          </h1>
        </div>

        {/* Landing Page Scroll Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => handleScrollTo(item)}
              className={`relative transition duration-300 font-display capitalize ${
                active === item
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {item}
              <span
                className={`absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 ${
                  active === item ? "w-full" : "w-0"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-300 hover:text-white transition duration-300 font-display"
          >
            Log In
          </button>

          <button
            onClick={() => navigate("/register")}
            className="relative px-5 py-2 font-semibold uppercase text-black font-display text-sm
                     bg-[#e6e6e6]
                     clip-signup
                     hover:bg-white
                     transition-all duration-300
                     shadow-md hover:shadow-lg"
          >
            SIGN UP
          </button>
        </div>
      </div>
    </motion.nav>
  );
}