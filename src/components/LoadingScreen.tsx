import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Unmount after 4.5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        key="loading-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1221]"
      >
        {/* Dot Grid Background similar to the video */}
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at center, #3bc8c8 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px'
          }}
        />
        
        <div className="relative z-10 flex items-center gap-6 sm:gap-8 scale-110 sm:scale-150">
          {/* Animated Pills */}
          <div className="flex flex-col justify-between w-[72px] h-[48px] select-none shrink-0 relative">
            
            {/* Top Pill */}
            <div className="h-[26%] w-full flex rounded-full overflow-hidden shadow-sm relative bg-[#1b5bd2]">
              <div className="w-[18%] h-full bg-[#1b5bd2]"></div>
              <div className="w-[82%] h-full bg-[#3bc8c8]"></div>
              {/* Glow sweep */}
              <motion.div 
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-1/2 bg-white blur-[8px]"
              />
            </div>

            {/* Middle Pill */}
            <div className="h-[26%] w-full flex rounded-full overflow-hidden shadow-sm relative bg-[#3bc8c8]">
              <div className="w-[18%] h-full bg-[#3bc8c8]"></div>
              <div className="w-[82%] h-full bg-[#ef7222]"></div>
              {/* Glow sweep */}
              <motion.div 
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, delay: 0.7, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-1/2 bg-white blur-[8px]"
              />
            </div>

            {/* Bottom Pill */}
            <div className="h-[26%] w-[52%] flex rounded-full overflow-hidden shadow-sm relative bg-[#dfa435]">
              <div className="w-[32%] h-full bg-[#dfa435]"></div>
              <div className="w-[68%] h-full bg-[#b22038]"></div>
              {/* Glow sweep */}
              <motion.div 
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, delay: 1.2, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-full bg-white blur-[6px]"
              />
            </div>
            
          </div>

          {/* Text */}
          <div className="flex items-baseline gap-1 relative">
            <motion.span 
              initial={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
              animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="text-[36px] tracking-tight leading-none whitespace-nowrap font-display"
            >
              <span className="font-light text-slate-300">Ask</span>
              <span className="font-semibold text-white tracking-wider ml-2">Deepak</span>
              <span className="font-bold text-indigo-400 ml-1.5">AI</span>
            </motion.span>
            
            {/* Text Glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.4, 0], scale: 1.1 }}
              transition={{ duration: 1.5, delay: 2.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-indigo-400 blur-2xl z-[-1]"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
