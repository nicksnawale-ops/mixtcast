import React, { useEffect, useRef, useState } from "react";
import { useAutoTour } from "./useAutoTour";

const useReducedMotionPref = () => {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
};

/** Floating "Auto Tour" toggle for the Home page (bottom-left, above the back-to-top button). Off by default. */
export const AutoTour: React.FC = () => {
  const reduced = useReducedMotionPref();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { running, start, stop } = useAutoTour(buttonRef);

  useEffect(() => {
    if (reduced) stop();
  }, [reduced, stop]);

  if (reduced) return null;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={running ? stop : start}
      aria-pressed={running}
      aria-label={running ? "Stop the auto tour" : "Start an auto tour of this page"}
      className={`fixed bottom-20 left-6 z-40 h-11 px-4 rounded-full bg-white/90 backdrop-blur-md border shadow-md flex items-center gap-1.5 text-xs font-bold tracking-wide transition-all duration-200 ${
        running ? "border-brand-orange text-brand-orange" : "border-line text-brand-navy hover:text-brand-orange hover:border-brand-orange"
      }`}
    >
      {running ? "Pause ❚❚" : "Auto Tour ▶"}
    </button>
  );
};
