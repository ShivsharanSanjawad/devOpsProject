export const mockPosts = [
  {
    id: 1,
    type: 'CONTEST', // Changed from ANNOUNCEMENT to match filters
    typeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    author: 'SystemAdmin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    timeAgo: '2 hours ago',
    title: 'Weekly Contest 385: Analysis & Editorial',
    excerpt: 'The official editorial for Weekly Contest 385 is now live. We discuss the dynamic programming approach for problem D and the graph theory optimization for problem...',
    replies: 142,
    upvotes: 856,
    views: '12k',
    isPinned: true,
    hasUpvoted: false,
    repliesList: []
  },
  {
    id: 2,
    type: 'PROBLEM',
    typeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
    author: 'CodeNinja99',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ninja',
    timeAgo: '45 mins ago',
    title: 'Optimizing O(N^2) solution for "Maximum Subarray Sum"?',
    excerpt: "I'm trying to solve the maximum subarray sum problem using Kadane's algorithm but I'm stuck on the edge case where all numbers are negative. Can someone explain how...",
    replies: 24,
    upvotes: 12,
    views: '345',
    isPinned: false,
    hasUpvoted: false,
    repliesList: []
  },
  {
    id: 3,
    type: 'DISCUSSION', // Changed from STRATEGY
    typeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    author: 'AlgoQueen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen',
    timeAgo: '3 hours ago',
    title: 'How to prepare for Google L4 interview in 3 months?',
    excerpt: "Sharing my roadmap for system design and advanced DSA topics. I've curated a list of 150 must-do problems focusing on Graphs, DP and Tries. Let me know if I should add...",
    replies: 89,
    upvotes: 432,
    views: '5.2k',
    isPinned: false,
    hasUpvoted: false,
    repliesList: []
  }
];

export const trendingTopics = [
  { id: 1, title: 'Dynamic Programming on Trees - Complete Guide', views: '2.4k' },
  { id: 2, title: 'Google Interview Experience (L3) - Rejected', views: '1.8k' },
  { id: 3, title: 'Why Rust is the future of competitive programming', views: '1.2k' },
  { id: 4, title: 'Segment Tree vs Fenwick Tree: When to use which?', views: '956' }
];