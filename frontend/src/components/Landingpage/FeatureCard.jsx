import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ title, description, icon: Icon, watermark: Watermark, theme }) => {
  const hoverBorderClass = theme.border?.includes('group-hover') 
    ? theme.border 
    : theme.border?.replace('hover:', 'group-hover:');
    
  const hoverTextClass = theme.groupText || 'group-hover:text-cyan-500';

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      // Reduced padding here to make the card shorter vertically
      className="relative overflow-hidden cursor-pointer group p-5 md:p-6 rounded-2xl bg-[#0b0f19] border border-[#1a1f2e] transition-all duration-300 hover:bg-[#0d121c]"
    >
      {/* Background Watermark Icon */}
      <motion.div
        variants={{
          rest: { scale: 1, rotate: -35, opacity: 0.5 },
          hover: { scale: 1.15, rotate: -25, opacity: 0.9, transition: { duration: 0.4, ease: "easeOut" } }
        }}
        // Adjusted top positioning and reduced size to fit the shorter card
        className={`absolute top-0 -right-2 text-[#161c2b] transition-colors duration-500 ${theme.text} ${hoverTextClass}`}
      >
        <Watermark size={120} strokeWidth={1} />
      </motion.div>

      {/* Top Icon Container */}
      <div className="relative z-10 mb-4"> {/* Reduced margin from mb-6 to mb-4 */}
        <motion.div 
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } }
          }}
          // Reduced icon box size from w-14/h-14 to w-12/h-12
          className={`w-12 h-12 flex items-center justify-center rounded-xl bg-[#111724] border border-[#1e2536] transition-colors duration-300 ${theme.text} ${hoverBorderClass}`}
        >
          <Icon size={20} className={`text-slate-400 transition-colors duration-300 ${hoverTextClass}`} />
        </motion.div>
      </div>

      {/* Text Content */}
      <div className="relative z-10 mt-auto">
        <motion.div 
          variants={{
            rest: { opacity: 1 },
            hover: { opacity: 1, transition: { duration: 0.3 } }
          }}
        > 
        <h3 className={`text-[18px] md:text-[20px] font-bold text-white mb-2 ${hoverTextClass}`}> {/* Reduced margin */}
          {title}
        </h3>
        </motion.div>

        <p className="text-slate-400 leading-snug text-[14px] transition-colors duration-300 group-hover:text-slate-300"> {/* Tightened leading and text size */}
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;