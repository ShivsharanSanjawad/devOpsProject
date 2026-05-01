import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import PostCard from './PostCard';
import CommunitySidebar from './CommunitySidebar';
import CreatePostModal from './CreatePostModal';
import { mockPosts } from './CommunityData';

// The exact names of the tabs
const FILTER_TABS = ['All Topics', 'Problems', 'Contests', 'General'];

const CommunityPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All Topics');
  
  // Initialize state from LocalStorage OR fallback to mockPosts
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem('codeArenaPosts');
    if (savedPosts) return JSON.parse(savedPosts);
    return mockPosts;
  });

  // Save to LocalStorage whenever posts change
  useEffect(() => {
    localStorage.setItem('codeArenaPosts', JSON.stringify(posts));
  }, [posts]);

  // Handle adding a new post
  const handleAddNewPost = (newPostData) => {
    const getTypeColor = (type) => {
      switch(type) {
        case 'PROBLEM': return 'bg-red-500/20 text-red-400 border border-red-500/30';
        case 'CONTEST': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
        default: return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      }
    };

    const newPost = {
      id: Date.now(),
      type: newPostData.type,
      typeColor: getTypeColor(newPostData.type),
      author: 'You_The_Player',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You_The_Player',
      timeAgo: 'Just now',
      title: newPostData.title,
      excerpt: newPostData.content,
      replies: 0,
      upvotes: 1,
      views: '1',
      isPinned: false,
      hasUpvoted: true, // You auto-upvote your own post
      repliesList: []
    };

    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  // Toggle Upvote Status
  const handleUpvote = (postId) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const isCurrentlyUpvoted = post.hasUpvoted;
        return {
          ...post,
          hasUpvoted: !isCurrentlyUpvoted,
          // If it was upvoted, subtract 1. If not, add 1.
          upvotes: isCurrentlyUpvoted ? post.upvotes - 1 : post.upvotes + 1
        };
      }
      return post;
    }));
  };

  // Add a Reply
  const handleReply = (postId, replyText) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: post.replies + 1,
          repliesList: [
            ...(post.repliesList || []), 
            { text: replyText, author: 'You_The_Player', time: 'Just now' }
          ]
        };
      }
      return post;
    }));
  };

  // Filter Logic
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'All Topics') return true;
    if (activeTab === 'Problems') return post.type === 'PROBLEM';
    if (activeTab === 'Contests') return post.type === 'CONTEST';
    if (activeTab === 'General') return post.type === 'DISCUSSION';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#090a0f] font-sans pb-20 relative">
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddNewPost} 
      />

      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Community</h1>
            <p className="text-gray-400 text-sm md:text-base">
              Discuss problems, contests, and winning strategies with elite coders.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.5)] whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Create Post
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search discussions, tags, or users..." 
              className="w-full bg-[#12141d] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {FILTER_TABS.map(filter => (
              <button 
                key={filter} 
                onClick={() => setActiveTab(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                  activeTab === filter 
                    ? 'bg-purple-900/40 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                    : 'bg-transparent border-transparent hover:bg-[#12141d] hover:border-gray-700 text-gray-400 hover:text-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Posts Feed */}
          <div className="flex-1 flex flex-col gap-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-[#12141d] rounded-xl border border-gray-800 border-dashed">
                <p className="text-gray-500 font-medium">No posts found in this category.</p>
                <button onClick={() => setActiveTab('All Topics')} className="text-purple-400 text-sm mt-2 hover:underline">
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onUpvote={handleUpvote}
                  onReply={handleReply}
                />
              ))
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <CommunitySidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;