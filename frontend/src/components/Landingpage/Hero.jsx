import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#070b1a] via-[#0b1020] to-[#070b1a] text-center px-6 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full top-[-200px] right-[-200px]"></div>
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full bottom-[-200px] left-[-200px]"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tight leading-tight"
        >
          <div className="text-white font-display">CODE.</div>
          <div className="text-white font-display">COMPETE.</div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-display"
          >
            CONQUER.
          </motion.div>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-gray-400 max-w-2xl mx-auto text-lg"
        >
          The Ultimate Real-Time Coding Arena. Battle developers worldwide,
          climb the ranks, and master algorithms in an immersive cyberpunk
          environment.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-6 justify-center"
        >
          <button onClick={() => navigate('/login')} className="px-8 py-3 rounded-md border border-cyan-400 text-cyan-400 font-semibold hover:bg-cyan-400 hover:text-black transition duration-300 shadow-lg shadow-cyan-500/20">
            ENTER ARENA →
          </button>

          <button onClick={() => navigate('/register')} className="px-8 py-3 rounded-md bg-[#10172a] border border-white/10 text-white font-semibold hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition duration-300">
            START 1V1 BATTLE
          </button>
        </motion.div>
      </div>
    </section>
  );
}