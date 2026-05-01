import React from 'react';
import { Play, FileCode2, Terminal } from 'lucide-react';
import Editor from "@monaco-editor/react";

const EditorPanel = ({ code, setCode, onRun, output, language }) => {
  
  // Quick helper to map generic language names to Monaco-supported language IDs
  const getMonacoLanguage = (lang) => {
    const l = lang.toLowerCase();
    if (l.includes('c++') || l === 'cpp') return 'cpp';
    if (l.includes('python')) return 'python';
    if (l.includes('java')) return 'java';
    if (l.includes('javascript') || l === 'js') return 'javascript';
    if (l.includes('rust')) return 'rust';
    return l; // fallback
  };

  // Quick helper for realistic file extensions in the tab
  const getFileExtension = (lang) => {
    const l = lang.toLowerCase();
    if (l.includes('python')) return 'py';
    if (l.includes('c++') || l === 'cpp') return 'cpp';
    if (l.includes('java')) return 'java';
    if (l.includes('javascript') || l === 'js') return 'js';
    if (l.includes('rust')) return 'rs';
    return 'txt';
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* --- TOP EDITOR BAR --- */}
      <div className="flex items-center justify-between bg-[#181825] border-b border-gray-800 px-4 py-2 shrink-0">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] rounded-t border-t border-cyan-500 text-gray-300 text-sm shadow-[0_-2px_10px_rgba(6,182,212,0.1)]">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            Solution.{getFileExtension(language)}
          </div>
        </div>
        <button 
          onClick={onRun}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded text-sm font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" /> Run & Test
        </button>
      </div>

      {/* --- MONACO EDITOR AREA --- */}
      <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            fontSize: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            minimap: { enabled: false }, // Hides the bulky minimap on the right
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            }
          }}
        />
      </div>

      {/* --- CONSOLE OUTPUT AREA --- */}
      <div className="h-56 bg-[#0b0b13] border-t border-gray-800 flex flex-col shrink-0">
        <div className="flex bg-[#181825] border-b border-gray-800 px-4 pt-2">
          <button className="px-4 py-2 text-sm text-white border-b-2 border-purple-500 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Console Output
          </button>
        </div>
        
        <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
          {output.length === 0 && <span className="text-gray-600">Click "Run & Test" to evaluate your code against the server...</span>}
          {output.map((line, idx) => (
            <div key={idx} className={`
              ${line.type === 'error' ? 'text-red-400' : ''}
              ${line.type === 'success' ? 'text-green-400 font-bold' : ''}
              ${line.type === 'info' ? 'text-gray-400' : ''}
            `}>
              {line.text}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default EditorPanel;