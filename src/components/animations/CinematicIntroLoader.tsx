import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface CinematicIntroLoaderProps {
  onComplete?: () => void;
}

export const CinematicIntroLoader: React.FC<CinematicIntroLoaderProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check session storage to ensure it plays only once per session
    const hasSeenIntro = sessionStorage.getItem("mixtcast_intro_shown");
    if (!hasSeenIntro) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleComplete();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("mixtcast_intro_shown", "true");
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-loader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white select-none overflow-hidden"
      >
        {/* Skip button in corner */}
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-ink-muted bg-surface-warm border border-line hover:text-ink hover:border-brand-orange/40 transition-colors"
          aria-label="Skip animation"
        >
          <span>Skip Intro</span>
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Ambient subtle light streak */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-orange/10 via-brand-navy/5 to-transparent" />

        <div className="relative flex flex-col items-center">
          {/* Logo Mark Motion Sequence */}
          <div className="relative w-72 h-36 flex items-center justify-center">
            <svg
              viewBox="0 0 240 120"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Left Waveform Bars: rising from center outward */}
              <g className="waveform-left">
                <line x1="24" y1="60" x2="88" y2="60" stroke="#FF5A1F" strokeWidth="3" strokeLinecap="round" />
                <motion.rect
                  x="72"
                  y="38"
                  width="4.5"
                  height="44"
                  rx="2.2"
                  fill="#FF5A1F"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  style={{ transformOrigin: "60px 60px" }}
                />
                <motion.rect
                  x="60"
                  y="26"
                  width="4.5"
                  height="68"
                  rx="2.2"
                  fill="#FF5A1F"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  style={{ transformOrigin: "60px 60px" }}
                />
                <motion.rect
                  x="48"
                  y="40"
                  width="4.5"
                  height="40"
                  rx="2.2"
                  fill="#FF5A1F"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  style={{ transformOrigin: "60px 60px" }}
                />
                <motion.rect
                  x="36"
                  y="50"
                  width="4.5"
                  height="20"
                  rx="2.2"
                  fill="#FF5A1F"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  style={{ transformOrigin: "60px 60px" }}
                />
              </g>

              {/* Orange Circle drawing itself */}
              <motion.circle
                cx="120"
                cy="60"
                r="34"
                stroke="#FF5A1F"
                strokeWidth="6"
                fill="#FFFFFF"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              />

              {/* Navy Play Triangle with projector flicker */}
              <motion.polygon
                points="112,44 112,76 138,60"
                fill="#0E3B8C"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: [0, 0.4, 0.2, 0.9, 0.7, 1],
                  scale: [0.7, 1.05, 0.98, 1],
                }}
                transition={{ delay: 0.7, duration: 0.5 }}
                style={{ transformOrigin: "120px 60px" }}
              />

              {/* Right Waveform Bars: rising from center outward */}
              <g className="waveform-right">
                <line x1="152" y1="60" x2="216" y2="60" stroke="#FF5A1F" strokeWidth="3" strokeLinecap="round" />
                <motion.rect
                  x="163"
                  y="38"
                  width="4.5"
                  height="44"
                  rx="2.2"
                  fill="#FF5A1F"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  style={{ transformOrigin: "180px 60px" }}
                />
                <motion.rect
                  x="175"
                  y="26"
                  width="4.5"
                  height="68"
                  rx="2.2"
                  fill="#FF5A1F"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  style={{ transformOrigin: "180px 60px" }}
                />
                <motion.rect
                  x="187"
                  y="40"
                  width="4.5"
                  height="40"
                  rx="2.2"
                  fill="#FF5A1F"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  style={{ transformOrigin: "180px 60px" }}
                />
                <motion.rect
                  x="199"
                  y="50"
                  width="4.5"
                  height="20"
                  rx="2.2"
                  fill="#FF5A1F"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                  style={{ transformOrigin: "180px 60px" }}
                />
              </g>
            </svg>
          </div>

          {/* Wordmark Letter Reveal with Lens-Flare Light Sweep */}
          <div className="relative overflow-hidden px-4 py-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="flex items-baseline text-4xl font-extrabold font-heading tracking-tight"
            >
              <span className="text-[#0E3B8C]">MIXT</span>
              <span className="text-[#FF5A1F]">CAST</span>
            </motion.div>

            {/* Lens flare light sweep passing across */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12 pointer-events-none"
            />
          </div>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.4 }}
            className="text-[10px] uppercase tracking-[0.3em] font-semibold text-ink mt-2"
          >
            Visual Solutions Pvt. Ltd
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
