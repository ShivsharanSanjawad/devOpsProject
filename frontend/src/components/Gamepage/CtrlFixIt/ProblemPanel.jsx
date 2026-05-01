import React from 'react';
import { Clock, HardDrive } from 'lucide-react';

const ProblemPanel = ({ question }) => {
  return (
    <div className="p-6 text-gray-300">
      <div className="flex gap-3 mb-4">
        <span className="px-2 py-1 text-xs font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded">
          {question.difficulty}
        </span>
        <span className="px-2 py-1 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded">
          {question.language}
        </span>
      </div>

      <h2 className="text-2xl text-white mb-4 font-bold">{question.title}</h2>

      <div className="flex gap-4 text-xs text-gray-500 mb-6">
        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Time Limit: {question.timeLimit}</div>
        <div className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> Memory: {question.memory}</div>
      </div>

      <div className="text-sm leading-relaxed mb-8 text-gray-400">
        <p>{question.description}</p>
      </div>

      <div className="mb-10">
        <h3 className="text-white text-sm uppercase font-bold tracking-wider mb-4">Testcases (Visible)</h3>
        <div className="space-y-4">
          {/* Slicing to only show the first 2 testcases visually */}
          {question.testCases.slice(0, 2).map((tc, idx) => (
             <div key={idx} className="bg-[#1a1a24] border border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-[#252535] px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Case {idx + 1}</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase">Input</p>
                    <div className="bg-[#0b0b13] rounded p-2 font-mono text-sm text-gray-300">{tc.input}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase">Expected</p>
                    <div className="bg-[#0b0b13] rounded p-2 font-mono text-sm text-green-400">{tc.expected}</div>
                  </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProblemPanel;