import React from "react";
import { motion } from "motion/react";

interface LogoProps {
  className?: string;
  animate?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Inline, animatable SVG component for MixtCast brand mark.
 * Has separate groups: left waveform bars, circle, play triangle, right waveform bars.
 */
export const LogoMark: React.FC<LogoProps> = ({ className = "w-10 h-10", animate = false }) => {
  return (
    <svg
      viewBox="0 0 240 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MIXTCAST Brand Mark"
    >
      {/* Left Waveform Bars */}
      <motion.g
        className="waveform-left"
        initial={animate ? { opacity: 0, scaleY: 0.3 } : false}
        animate={animate ? { opacity: 1, scaleY: [0.6, 1, 0.7, 1] } : undefined}
        transition={animate ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" } : undefined}
      >
        <line x1="24" y1="60" x2="88" y2="60" stroke="#FF5A1F" strokeWidth="3" strokeLinecap="round" />
        <rect x="36" y="50" width="4.5" height="20" rx="2.2" fill="#FF5A1F" />
        <rect x="48" y="40" width="4.5" height="40" rx="2.2" fill="#FF5A1F" />
        <rect x="60" y="26" width="4.5" height="68" rx="2.2" fill="#FF5A1F" />
        <rect x="72" y="38" width="4.5" height="44" rx="2.2" fill="#FF5A1F" />
      </motion.g>

      {/* Center Orange Outlined Circle */}
      <motion.circle
        cx="120"
        cy="60"
        r="34"
        stroke="#FF5A1F"
        strokeWidth="6"
        fill="#FFFFFF"
        initial={animate ? { pathLength: 0 } : false}
        animate={animate ? { pathLength: 1 } : undefined}
        transition={animate ? { duration: 1.2, ease: "easeOut" } : undefined}
      />

      {/* Center Navy Play Triangle */}
      <motion.polygon
        points="112,44 112,76 138,60"
        fill="#0E3B8C"
        stroke="#0E3B8C"
        strokeWidth="2"
        strokeLinejoin="round"
        initial={animate ? { scale: 0.7, opacity: 0 } : false}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={animate ? { delay: 0.3, duration: 0.6 } : undefined}
      />

      {/* Right Waveform Bars */}
      <motion.g
        className="waveform-right"
        initial={animate ? { opacity: 0, scaleY: 0.3 } : false}
        animate={animate ? { opacity: 1, scaleY: [0.7, 1, 0.6, 1] } : undefined}
        transition={animate ? { repeat: Infinity, duration: 2.2, delay: 0.2, ease: "easeInOut" } : undefined}
      >
        <line x1="152" y1="60" x2="216" y2="60" stroke="#FF5A1F" strokeWidth="3" strokeLinecap="round" />
        <rect x="163" y="38" width="4.5" height="44" rx="2.2" fill="#FF5A1F" />
        <rect x="175" y="26" width="4.5" height="68" rx="2.2" fill="#FF5A1F" />
        <rect x="187" y="40" width="4.5" height="40" rx="2.2" fill="#FF5A1F" />
        <rect x="199" y="50" width="4.5" height="20" rx="2.2" fill="#FF5A1F" />
      </motion.g>
    </svg>
  );
};

/**
 * Compact horizontal lockup for the sticky header (single-line brand lockup).
 */
export const LogoHorizontal: React.FC<{ className?: string; animate?: boolean }> = ({
  className = "h-9",
  animate = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark className="w-12 h-8 shrink-0" animate={animate} />
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline text-xl font-bold tracking-tight font-heading">
          <span className="text-[#0E3B8C]">MIXT</span>
          <span className="text-[#FF5A1F]">CAST</span>
        </div>
        <span className="text-[7.5px] font-semibold tracking-[0.22em] text-[#1F2328]/80 uppercase mt-0.5 whitespace-nowrap">
          Visual Solutions
        </span>
      </div>
    </div>
  );
};

/**
 * Full stacked official brand lockup with mark, bold wordmark, and wide tracked subline.
 */
export const LogoFull: React.FC<{ className?: string; animate?: boolean }> = ({
  className = "w-64",
  animate = false,
}) => {
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      <LogoMark className="w-44 h-24 mb-2 shrink-0" animate={animate} />
      <div className="flex items-baseline text-3xl font-extrabold tracking-tight font-heading">
        <span className="text-[#0E3B8C]">MIXT</span>
        <span className="text-[#FF5A1F]">CAST</span>
      </div>
      <span className="text-[10px] font-semibold tracking-[0.28em] text-[#1F2328] uppercase mt-1">
        Visual Solutions Pvt. Ltd
      </span>
    </div>
  );
};
