import React from 'react';
import { Swords } from 'lucide-react';

const GameHero = () => {
  return (
    <div className="relative min-h-[60vh] bg-[#0b0614] flex flex-col items-center justify-start overflow-hidden font-sans pt-12">
      
      {/* Background Grid & Stars Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">

        {/* Main Title Area */}
        <div className="flex flex-col items-center leading-none mb-6">
          <div className="flex items-center gap-4 text-white">
            <Swords className="w-12 h-12 md:w-16 md:h-16 text-gray-300" strokeWidth={1.5} />
            <h1 className="text-6xl md:text-8xl tracking-tighter uppercase text-white font-display font-bold">Code</h1>
          </div>
          
          <div className="relative mt-2">
            <h1 className="text-6xl md:text-8xl tracking-tighter uppercase text-white font-display font-bold">Battles</h1>
            {/* Colorful underline effect under BATTLES */}
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-cyan-400 to-transparent rounded-full"></div>
          </div>
          
          <h1 className="text-6xl md:text-8xl tracking-tighter text-gray-300 mt-4 uppercase font-display font-bold">Arena</h1>
        </div>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg md:text-xl mt-6 max-w-2xl">
          Compete. Fix. Dominate. <span className="text-purple-400">Join the ultimate coding battleground.</span>
        </p>

      </div>
    </div>
  );
};

export default GameHero;