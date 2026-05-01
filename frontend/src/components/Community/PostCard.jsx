import React, { useState } from 'react';
import { MessageSquare, ArrowUp, Eye, Pin, Send } from 'lucide-react';

const PostCard = ({ post, onUpvote, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(post.id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className={`group p-5 rounded-xl bg-[#12141d] border transition-all duration-300 hover:-translate-y-1 
      ${post.isPinned 
        ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:border-purple-400' 
        : 'border-gray-800 hover:border-gray-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
      }`}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-700 shrink-0 overflow-hidden border border-gray-600 group-hover:border-gray-400 transition-colors">
          <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${post.typeColor}`}>
                {post.type}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">Posted by <span className="text-gray-200 font-medium">{post.author}</span></span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">{post.timeAgo}</span>
            </div>
            {post.isPinned && <Pin className="w-4 h-4 text-purple-500 fill-purple-500/20" />}
          </div>

          <h3 className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors mb-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Action Footer */}
          <div className="flex items-center gap-6 text-xs font-medium text-gray-500">
            {/* Reply Button */}
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className={`flex items-center gap-1.5 transition-colors ${isReplying ? 'text-blue-400' : 'hover:text-gray-300 group-hover:text-blue-400'}`}
            >
              <MessageSquare className="w-4 h-4" />
              {post.replies} Replies
            </button>
            
            {/* Upvote Button */}
            <button 
              onClick={() => onUpvote(post.id)}
              className={`flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 ${post.hasUpvoted ? 'text-green-400 font-bold' : 'hover:text-green-400 group-hover:text-green-500/80'}`}
            >
              <ArrowUp className={`w-4 h-4 ${post.hasUpvoted ? 'fill-current' : ''}`} />
              {post.upvotes} Upvotes
            </button>

            {/* View Count (Static) */}
            <div className="flex items-center gap-1.5 hover:text-gray-300 transition-colors cursor-default">
              <Eye className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
              {post.views} Views
            </div>
          </div>

          {/* Animated Reply Dropdown */}
          {isReplying && (
            <div className="mt-4 pt-4 border-t border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..." 
                  className="flex-1 bg-[#0b0c10] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
                <button 
                  onClick={handleReplySubmit}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Show local replies if any exist */}
              {post.repliesList && post.repliesList.length > 0 && (
                <div className="mt-4 space-y-3">
                  {post.repliesList.map((reply, idx) => (
                    <div key={idx} className="bg-[#0b0c10] p-3 rounded-lg border border-gray-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-300">{reply.author}</span>
                        <span className="text-[10px] text-gray-500">{reply.time}</span>
                      </div>
                      <p className="text-sm text-gray-400">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PostCard;