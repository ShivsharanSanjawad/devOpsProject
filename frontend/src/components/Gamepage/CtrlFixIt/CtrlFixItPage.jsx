import React, { useState, useEffect } from 'react';
import TopNav from './TopNav';
import ProblemPanel from './ProblemPanel';
import EditorPanel from './EditorPanel';
import { gameQuestions } from './gameData';

const CtrlFixItPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [userCode, setUserCode] = useState(gameQuestions[0].initialCode);
  const [consoleOutput, setConsoleOutput] = useState([]);
  
  const currentQ = gameQuestions[currentIndex];

  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('lost');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Static evaluation: strips whitespace to compare the edited code with the correct code
  const normalizeCode = (code) => code.replace(/\s+/g, '');

  const handleRunCode = () => {
    setConsoleOutput([{ type: 'info', text: '> Compiling solution...' }]);
    
    setTimeout(() => {
      setConsoleOutput(prev => [...prev, { type: 'info', text: '> Running 10 test cases against server...' }]);
      
      const isCorrect = normalizeCode(userCode) === normalizeCode(currentQ.correctCode);
      let testCaseIndex = 0;
      
      const testInterval = setInterval(() => {
        if (testCaseIndex < 10) {
          const currentTest = currentQ.testCases[testCaseIndex];
          const isVisible = testCaseIndex < 2;
          const caseLabel = isVisible ? `Case ${testCaseIndex + 1} (Visible)` : `Case ${testCaseIndex + 1} (Hidden)`;

          if (isCorrect) {
            setConsoleOutput(prev => [...prev, { type: 'success', text: `> ${caseLabel}: Passed \u2713` }]);
          } else {
            setConsoleOutput(prev => [
              ...prev,
              { type: 'error', text: `> ${caseLabel}: FAILED \u2715` },
              { type: 'info', text: `  Input: ${isVisible ? currentTest.input : '[HIDDEN]'}` },
              { type: 'info', text: `  Expected: ${isVisible ? currentTest.expected : '[HIDDEN]'}` },
              { type: 'error', text: '> Execution halted due to failed test case.' }
            ]);
            clearInterval(testInterval);
            return;
          }
          testCaseIndex++;
        } else {
          clearInterval(testInterval);
          setConsoleOutput(prev => [
            ...prev, 
            { type: 'success', text: '\n> \u2605 ALL 10 TEST CASES PASSED \u2605' },
            { type: 'info', text: '> Proceeding to next level in 2 seconds...' }
          ]);
          
          setTimeout(() => {
            if (currentIndex === gameQuestions.length - 1) {
              setGameState('won');
            } else {
              const nextIndex = currentIndex + 1;
              setCurrentIndex(nextIndex);
              setUserCode(gameQuestions[nextIndex].initialCode);
              setConsoleOutput([]); 
            }
          }, 2000);
        }
      }, 150); 
    }, 800); 
  };

  // Win / Loss Screens
  if (gameState !== 'playing') {
    return (
      <div className="h-screen w-full bg-[#0b0b13] flex flex-col items-center justify-center text-white relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h1 className={`text-6xl md:text-8xl mb-4 font-display text-center uppercase ${gameState === 'won' ? 'text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]'}`}>
            {gameState === 'won' ? 'Mission\nAccomplished' : 'System\nFailure'}
          </h1>
          <p className="text-xl text-gray-400 mb-10 text-center max-w-md">
            {gameState === 'won' ? `Incredible work. You fixed all 5 bugs with ${formatTime(timeLeft)} remaining on the clock!` : 'The bugs took over the system before you could patch them all.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className={`px-10 py-4 rounded font-display uppercase tracking-widest transition-all transform hover:scale-105 ${gameState === 'won' ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0b0b13] text-white flex flex-col font-sans overflow-hidden">
      <TopNav timeLeft={formatTime(timeLeft)} level={currentIndex + 1} />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[40%] min-w-[350px] border-r border-gray-800 bg-[#12121a] flex flex-col h-full overflow-y-auto custom-scrollbar">
          <ProblemPanel question={currentQ} />
        </div>
        <div className="flex-1 flex flex-col bg-[#1e1e2e] h-full overflow-hidden">
          <EditorPanel 
            code={userCode} 
            setCode={setUserCode} 
            onRun={handleRunCode}
            output={consoleOutput}
            language={currentQ.language}
          />
        </div>
      </div>
    </div>
  );
};

export default CtrlFixItPage;