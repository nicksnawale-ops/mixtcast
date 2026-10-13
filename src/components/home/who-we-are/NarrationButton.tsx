import React, { useId } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { AudioLines, Loader2 } from "lucide-react";
import type { NarrationStatus } from "./useNarration";

interface NarrationButtonProps {
  status: NarrationStatus;
  /** Gentle pulse inviting a tap (auto-read was blocked by the browser). */
  pulse: boolean;
  progress: MotionValue<number>;
  reduced: boolean;
  onToggle: () => void;
}

const RING_R = 22;
const RING_C = 2 * Math.PI * RING_R;

/** "Listen" control for the Who We Are narration: 40px round button with a progress ring and live equalizer. */
export const NarrationButton: React.FC<NarrationButtonProps> = ({ status, pulse, progress, reduced, onToggle }) => {
  const tipId = useId();
  const playing = status === "playing";
  const busy = playing || status === "loading";
  const dashOffset = useTransform(progress, (p) => RING_C * (1 - p));
  const showRing = status !== "idle";

  return (
    <div className="group relative flex items-center gap-2.5 shrink-0">
      <div className="relative w-10 h-10">
        {/* Progress ring */}
        <svg aria-hidden="true" className="absolute -inset-1 w-12 h-12 -rotate-90 pointer-events-none" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r={RING_R} stroke="rgba(14,59,140,0.12)" strokeWidth="1.5" opacity={showRing ? 1 : 0} />
          <motion.circle
            cx="24"
            cy="24"
            r={RING_R}
            stroke="#FF5A1F"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray={RING_C}
            style={{ strokeDashoffset: dashOffset, opacity: showRing ? 1 : 0 }}
          />
        </svg>

        {/* Pulse invitation */}
        {pulse && !busy && !reduced && (
          <span aria-hidden="true" className="wwa-ping wwa-idle absolute inset-0 rounded-full bg-brand-navy/20 pointer-events-none" />
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={busy}
          aria-label={busy ? "Pause narration" : "Listen to our story (AI voice)"}
          aria-describedby={tipId}
          className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 ${
            busy ? "bg-brand-navy border-brand-navy text-white" : "bg-white border-brand-navy/60 text-brand-navy hover:border-brand-navy hover:bg-brand-navy/5"
          }`}
        >
          {status === "loading" ? (
            <Loader2 className={`w-4 h-4 ${reduced ? "" : "animate-spin"}`} aria-hidden="true" />
          ) : playing ? (
            <span aria-hidden="true" className="flex items-end gap-[2px] h-3.5">
              {[0.55, 1, 0.7, 0.9].map((h, i) => (
                <span
                  key={i}
                  className={`w-[2px] rounded-full bg-white ${reduced ? "" : "wwa-meter-bar wwa-idle"}`}
                  style={{ height: `${h * 100}%`, animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </span>
          ) : (
            <AudioLines className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <span className="leading-tight select-none" aria-hidden="true">
        <span className="block text-xs font-semibold text-brand-navy">{busy ? "Pause" : "Listen"}</span>
        <span className="block text-[10px] text-ink-muted">AI voice</span>
      </span>

      {/* Tooltip */}
      <span
        id={tipId}
        role="tooltip"
        className="pointer-events-none absolute right-0 bottom-full mb-2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        Listen to our story
      </span>

      {/* Screen-reader status */}
      <span className="sr-only" aria-live="polite">
        {playing ? "Playing" : status === "paused" ? "Paused" : ""}
      </span>
    </div>
  );
};
