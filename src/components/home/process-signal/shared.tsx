import React, { useEffect, useState } from "react";
import { COMPANY_INFO } from "../../../data/company";
import { motion, useTransform, type MotionValue } from "motion/react";

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Section header — markup and copy as before the redesign. */
export const ProcessHeader: React.FC<{ className?: string }> = ({ className = "mb-16" }) => (
  <div className={`text-center max-w-2xl mx-auto ${className}`}>
    <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">Methodology</span>
    <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading">Our {COMPANY_INFO.process.length}-Stage Engineering Process</h2>
    <p className="mt-3 text-base text-ink-muted">
      From the initial site survey to long-term preventative care, we uphold rigorous quality standards.
    </p>
  </div>
);

/** "● System Live" end-state pill. */
export const SystemLivePill: React.FC<{ className?: string }> = ({ className = "" }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full border border-brand-orange/25 bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-navy shadow-[0_6px_20px_-10px_rgba(255,90,31,0.6)] ${className}`}
  >
    <span aria-hidden="true" className="relative flex w-2 h-2">
      <span className="ps-live-ping absolute inset-0 rounded-full bg-brand-orange" />
      <span className="relative w-2 h-2 rounded-full bg-brand-orange" />
    </span>
    System Live
  </span>
);

/**
 * Faint blueprint grid (navy ~3%), fading toward the edges via a vignette in the section colour (no CSS mask).
 * Optional reveal hook for the "Site Survey Scan" transition: a `--ps-scan` length set on the `[data-ps-grid]`
 * element shows the grid only above that line (two counter-moving transforms in a clip). Unset = fully visible.
 */
export const BlueprintGrid: React.FC = () => (
  <div aria-hidden="true" data-ps-grid className="ps-grid pointer-events-none absolute inset-0 overflow-hidden">
    <div className="ps-scan-clip absolute inset-0 overflow-hidden">
      <div
        className="ps-scan-inner absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(243,246,251,0) 30%, #F3F6FB 100%), linear-gradient(rgba(14,59,140,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(14,59,140,0.03) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
          backgroundPosition: "center, center, center",
        }}
      />
    </div>
  </div>
);

/**
 * Reveals its content from the start edge as `progress` goes 0 → 1 — the "drawing" of the signal line.
 * Two counter-moving transforms inside an overflow clip: compositor-only, so the (already painted) line is never
 * repainted while scrolling, unlike animating stroke-dashoffset on a full-width path.
 */
export const Reveal: React.FC<{ progress: MotionValue<number>; axis: "x" | "y"; className?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({
  progress,
  axis,
  className = "",
  style,
  children,
}) => {
  const outer = useTransform(progress, (p) => `${(p - 1) * 100}%`);
  const inner = useTransform(progress, (p) => `${(1 - p) * 100}%`);
  return (
    <motion.div className={`overflow-hidden will-change-transform ${className}`} style={{ ...style, [axis]: outer }}>
      <motion.div className="w-full h-full will-change-transform" style={{ [axis]: inner }}>
        {children}
      </motion.div>
    </motion.div>
  );
};

export const useMedia = (query: string) => {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
};

/** True while the element is near the viewport and the tab is visible (idle loops pause otherwise). */
export const useRunning = (ref: React.RefObject<HTMLElement | null>) => {
  const [onScreen, setOnScreen] = useState(false);
  const [visible, setVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: "100px 0px" });
    observer.observe(el);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return onScreen && visible;
};

/** Scoped CSS loops (transform/opacity only), paused with the section via `[data-paused]`. */
export const SIGNAL_CSS = `
@keyframes ps-ping { 0% { transform: scale(1); opacity: 0.7; } 80%, 100% { transform: scale(2.6); opacity: 0; } }
.ps-live-ping { animation: ps-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
@keyframes ps-breathe { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.09); } }
.ps-breathe { transform-origin: center; animation: ps-breathe 3.6s ease-in-out infinite; }
[data-paused] .ps-live-ping, [data-paused] .ps-breathe { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .ps-live-ping, .ps-breathe { animation: none !important; } }
.ps-scan-clip { transform: translateY(min(0px, calc(var(--ps-scan, 100000px) - 100%))); }
.ps-scan-inner { transform: translateY(max(0px, calc(100% - var(--ps-scan, 100000px)))); }
.ps-grid[data-scanning] .ps-scan-clip, .ps-grid[data-scanning] .ps-scan-inner { will-change: transform; }
.ps-num { font-family: var(--font-heading); font-weight: 800; line-height: 1; letter-spacing: -0.02em; -webkit-text-stroke: 1.5px #0E3B8C; }
`;
