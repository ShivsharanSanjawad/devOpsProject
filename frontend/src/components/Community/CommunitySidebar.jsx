import React from 'react';
import { PieChart, TrendingUp, Wifi } from 'lucide-react';
import { trendingTopics } from './CommunityData';

const CommunitySidebar = () => {
  return (
    <div className="space-y-6">
      
      {/* Community Stats */}
      <div className="bg-[#12141d] border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-5 uppercase tracking-wider">
          <PieChart className="w-4 h-4 text-cyan-400" /> Community Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#0b0c10] p-4 rounded-lg border border-gray-800/50">
            <div className="text-2xl font-black text-white mb-1">12.5k</div>
            <div className="text-xs text-gray-500">Total Discussions</div>
          </div>
          <div className="bg-[#0b0c10] p-4 rounded-lg border border-gray-800/50">
            <div className="text-2xl font-black text-purple-400 mb-1">842</div>
            <div className="text-xs text-gray-500">Online Users</div>
          </div>
        </div>
        
        <div className="bg-[#0b0c10] p-4 rounded-lg border border-gray-800/50 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-white mb-0.5">3 Active</div>
            <div className="text-xs text-gray-500">Contest Threads</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Trending Now */}
      <div className="bg-[#12141d] border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-5 uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-purple-500" /> Trending Now
        </h3>
        
        <div className="space-y-4">
          {trendingTopics.map((topic, idx) => (
            <div key={topic.id} className="flex gap-3 group cursor-pointer">
              <div className="text-sm font-bold text-gray-600 group-hover:text-purple-400 transition-colors">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-2 mb-1">
                  {topic.title}
                </h4>
                <div className="text-xs text-gray-500">{topic.views} views today</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default CommunitySidebar;