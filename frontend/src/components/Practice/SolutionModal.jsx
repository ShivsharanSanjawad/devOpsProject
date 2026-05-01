import React from 'react';
import { X, Code2, Clock, HardDrive, CheckCircle2 } from 'lucide-react';

const SolutionModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0b0c10] border border-gray-700 rounded-xl shadow-2xl shadow-purple-900/20 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Optimal Solution</h2>
              <p className="text-gray-400 text-sm">Two-Pointer Approach</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Complexity Badges */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#12141d] border border-gray-700 rounded-lg">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-gray-300">Time Complexity: <span className="text-white">O(N)</span></span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#12141d] border border-gray-700 rounded-lg">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-gray-300">Space Complexity: <span className="text-white">O(1)</span></span>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Intuition & Explanation</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Instead of using a nested loop which results in O(N²) time complexity, we can use the two-pointer technique. By initializing one pointer at the beginning and one at the end of the array, we can iterate inwards. If the sum is too small, we increment the left pointer. If it's too large, we decrement the right pointer.
            </p>
          </div>

          {/* Code Block */}
          <div className="rounded-lg overflow-hidden border border-gray-800">
            <div className="flex items-center gap-2 bg-[#12141d] px-4 py-2 border-b border-gray-800 text-sm text-gray-400">
              <Code2 className="w-4 h-4" /> solution.cpp
            </div>
            <div className="bg-[#090a0f] p-4 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed text-gray-300">
<code><span className="text-blue-400">class</span> <span className="text-yellow-300">Solution</span> {'{'}
<span className="text-blue-400">public:</span>
    <span className="text-teal-400">vector&lt;int&gt;</span> <span className="text-blue-300">twoSum</span>(<span className="text-teal-400">vector&lt;int&gt;</span>& numbers, <span className="text-teal-400">int</span> target) {'{'}
        <span className="text-teal-400">int</span> left = <span className="text-orange-400">0</span>;
        <span className="text-teal-400">int</span> right = numbers.<span className="text-blue-300">size</span>() - <span className="text-orange-400">1</span>;
        
        <span className="text-blue-400">while</span> (left &lt; right) {'{'}
            <span className="text-teal-400">int</span> currentSum = numbers[left] + numbers[right];
            <span className="text-blue-400">if</span> (currentSum == target) {'{'}
                <span className="text-blue-400">return</span> {'{'}left + <span className="text-orange-400">1</span>, right + <span className="text-orange-400">1</span>{'}'};
            {'}'} <span className="text-blue-400">else if</span> (currentSum &lt; target) {'{'}
                left++;
            {'}'} <span className="text-blue-400">else</span> {'{'}
                right--;
            {'}'}
        {'}'}
        <span className="text-blue-400">return</span> {'{-1, -1}'};
    {'}'}
{'}'};</code>
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SolutionModal;