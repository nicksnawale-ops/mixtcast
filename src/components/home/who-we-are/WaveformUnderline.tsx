import React, { useId } from "react";
import { motion } from "motion/react";
import { EASE_OUT } from "./whoWeAreData";

// One tapered audio waveform in a 100×8 box (stretched to the word's width; the stroke doesn't scale).
const WAVE_PATH = (() => {
  const points = 64;
  const cycles = 9;
  let d = "";
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const envelope = Math.pow(Math.sin(Math.PI * t), 1.3); // amplitude tapers to 0 at both ends
    const y = 4 - Math.sin(t * cycles * 2 * Math.PI) * envelope * 3.2;
    d += `${i ? "L" : "M"}${(t * 100).toFixed(2)} ${y.toFixed(2)} `;
  }
  return d.trim();
})();

interface WaveformUnderlineProps {
  /** When the draw starts (s). */
  delay: number;
  shown: boolean;
  reduced: boolean;
  /** Brief amplitude swell (e.g. while the word is hovered). */
  swell: boolean;
}

/** Slim navy → orange audio waveform under a headline word: draws in, then idles with a gentle shimmer. */
export const WaveformUnderline: React.FC<WaveformUnderlineProps> = ({ delay, shown, reduced, swell }) => {
  const gradientId = `wwa-wave-${useId().replace(/:/g, "")}`;
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 right-0 top-[calc(100%+0.02em)] h-[8px] ${reduced ? "" : "wwa-wave-idle wwa-idle"}`}
      style={reduced ? undefined : { animationDelay: `${delay + 0.7}s` }}
    >
      <motion.svg
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        className="block w-full h-full overflow-visible"
        fill="none"
        style={{ transformOrigin: "50% 50%" }}
        initial={false}
        animate={swell && !reduced ? { scaleY: [1, 1.9, 1] } : { scaleY: 1 }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0E3B8C" />
            <stop offset="1" stopColor="#FF5A1F" />
          </linearGradient>
        </defs>
        <motion.path
          d={WAVE_PATH}
          stroke={`url(#${gradientId})`}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={shown ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ pathLength: { duration: 0.7, delay: reduced ? 0 : delay, ease: EASE_OUT }, opacity: { duration: 0.15, delay: reduced ? 0 : delay } }}
        />
      </motion.svg>
    </span>
  );
};
