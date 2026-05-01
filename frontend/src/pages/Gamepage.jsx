import React from 'react';
import GameHero from '../components/Gamepage/GameHero';
import GameModes from '../components/Gamepage/GameModes';

const GamePage = () => {
  return (
    <div className="min-h-screen bg-[#0b0614] pb-5">
      <GameHero />
      <GameModes /> 
    </div>
  );
};

export default GamePage;