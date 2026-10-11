import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play } from "lucide-react";

interface CurtainRevealProps {
  children: React.ReactNode;
}

export const CurtainReveal: React.FC<CurtainRevealProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      setIsDismissed(true);
    }, 1200);
  };

  return (
    <div className="relative overflow-hidden w-full">
      {/* Underlying Content */}
      <div className="w-full">{children}</div>

      {/* Parting Curtain Panels */}
      <AnimatePresence>
        {!isDismissed && (
          <div className="absolute inset-0 z-30 pointer-events-auto flex">
            {/* Left Curtain */}
            <motion.div
              initial={{ x: "0%" }}
              animate={isOpen ? { x: "-100%" } : { x: "0%" }}
              transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
              className="w-1/2 h-full bg-[#0A2A63] border-r border-[#FF5A1F]/30 shadow-2xl flex items-center justify-end pr-8 relative overflow-hidden"
            >
              {/* Decorative curtain folds */}
              <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(90deg,_transparent,_transparent_30px,_rgba(255,255,255,0.08)_30px,_rgba(255,255,255,0.08)_60px)]" />
            </motion.div>

            {/* Right Curtain */}
            <motion.div
              initial={{ x: "0%" }}
              animate={isOpen ? { x: "100%" } : { x: "0%" }}
              transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
              className="w-1/2 h-full bg-[#0A2A63] border-l border-[#FF5A1F]/30 shadow-2xl flex items-center justify-start pl-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(90deg,_transparent,_transparent_30px,_rgba(255,255,255,0.08)_30px,_rgba(255,255,255,0.08)_60px)]" />
            </motion.div>

            {/* Center Unveiling Trigger */}
            {!isOpen && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-40 text-white">
                <motion.button
                  onClick={handleOpen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-6 py-3 rounded-full bg-brand-orange text-white font-semibold text-sm shadow-xl shadow-brand-orange/30 hover:bg-brand-orange-soft transition-all"
                  aria-label="Reveal engineered solutions"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Reveal Engineered Solutions</span>
                </motion.button>
                <span className="text-xs text-white/70 tracking-widest uppercase mt-3">
                  Theatre Curtain Transition
                </span>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
