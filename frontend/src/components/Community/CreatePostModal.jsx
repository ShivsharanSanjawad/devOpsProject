import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('DISCUSSION');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    onSubmit({ title, content, type });
    
    // Reset and close
    setTitle('');
    setContent('');
    setType('DISCUSSION');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content - Animated Entry */}
      <div className="relative w-full max-w-2xl bg-[#12141d] border border-gray-700 rounded-xl shadow-2xl shadow-purple-900/20 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Create New Post</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Topic Tag</label>
            <div className="flex gap-3">
              {/* CHANGED HERE: STRATEGY is now CONTEST to match the filter tabs! */}
              {['DISCUSSION', 'PROBLEM', 'CONTEST'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    type === t 
                      ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to discuss?"
              className="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600"
              required
            />
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Content</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Elaborate on your problem, strategy, or thoughts..."
              className="w-full bg-[#0b0c10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all min-h-[150px] resize-y placeholder-gray-600 custom-scrollbar"
              required
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              <Send className="w-4 h-4" /> Post Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;