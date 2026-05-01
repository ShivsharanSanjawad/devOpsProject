import React from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, Zap, 
  Bot, Brain, 
  Users, Crown, 
  Fingerprint, Shield, 
  Network, 
  Calendar, Flame 
} from 'lucide-react';
import FeatureCard from './FeatureCard';

const features = [
  {
    title: "Real-Time 1v1 Battles",
    description: "Challenge opponents worldwide in synchronized coding duels. First to pass all test cases wins the glory and rating points.",
    icon: Gamepad2,
    watermark: Zap,
    theme: {
      border: "hover:border-cyan-500",
      text: "text-cyan-500",
      groupText: "group-hover:text-cyan-500",
      shadow: "hover:shadow-cyan-500/10"
    }
  },
  {
    title: "AI-Powered Feedback",
    description: "Get instant, intelligent code analysis. Our AI identifies complexity issues and suggests optimizations in real-time.",
    icon: Bot,
    watermark: Brain,
    theme: {
      border: "hover:border-purple-500",
      text: "text-purple-500",
      groupText: "group-hover:text-purple-500",
      shadow: "hover:shadow-purple-500/10"
    }
  },
  {
    title: "Battle Royale Contests",
    description: "100 coders enter, one leaves. Survive rounds of increasing difficulty as the lowest performers are eliminated.",
    icon: Users,
    watermark: Crown,
    theme: {
      border: "hover:border-yellow-500",
      text: "text-yellow-500",
      groupText: "group-hover:text-yellow-500",
      shadow: "hover:shadow-yellow-500/10"
    }
  },
  {
    title: "Smart Plagiarism Detection",
    description: "Fair play guaranteed. Advanced heuristics detect code similarity and logic cloning to ensure competitive integrity.",
    icon: Fingerprint,
    watermark: Shield,
    theme: {
      border: "hover:border-green-500",
      text: "text-green-500",
      groupText: "group-hover:text-green-500",
      shadow: "hover:shadow-green-500/10"
    }
  },
  {
    title: "Skill Tree Gamification",
    description: "Visualize your growth. Unlock nodes on your DSA skill tree as you master new algorithms and data structures.",
    icon: Network,
    watermark: Network,
    theme: {
      border: "hover:border-pink-500",
      text: "text-pink-500",
      groupText: "group-hover:text-pink-500",
      shadow: "hover:shadow-pink-500/10"
    }
  },
  {
    title: "Daily Coding Arena",
    description: "New challenges every 24 hours. Keep your streak alive and earn exclusive badges and profile customizations.",
    icon: Calendar,
    watermark: Flame,
    theme: {
      border: "hover:border-orange-500",
      text: "text-orange-500",
      groupText: "group-hover:text-orange-500",
      shadow: "hover:shadow-orange-500/10"
    }
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const FeaturesGrid = () => {
  return (
    // Reduced py-20 to py-10 or py-12 to save vertical space
    <section id="features" className="bg-[#05070a] py-10 px-6 min-h-screen flex items-center justify-center">
      {/* Increased max-w-5xl back to max-w-7xl to widen the grid */}
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Reduced bottom margin from mb-16 to mb-10 */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-3 font-display">
            BATTLEGROUND <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">FEATURES</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            Equip yourself with next-gen tools designed for competitive dominance.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGrid;