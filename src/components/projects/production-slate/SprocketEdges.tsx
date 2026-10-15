import React, { useEffect, useState } from "react";

/**
 * Faint film-strip edges for the Projects page (desktop): a column of small rounded sprocket holes (navy ~5%) in the
 * far left and right gutters, drifting slowly upward. One element per side — the holes are a repeating SVG
 * background, moved by a transform over a whole number of holes so the loop is seamless. Paused when the tab is
 * hidden; static with reduced motion.
 */

const PITCH = 28; // px between holes
const HOLES_PER_LOOP = 24; // the strip travels this many holes per loop
const LOOP_S = 60;

const HOLE = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="${PITCH}"><rect x="2" y="7" width="10" height="14" rx="3" fill="#0E3B8C" fill-opacity="0.05"/></svg>`,
);

const CSS = `
.sprocket-strip { background-image: url("data:image/svg+xml,${HOLE}"); background-repeat: repeat-y; animation: sprocket-drift ${LOOP_S}s linear infinite; }
@keyframes sprocket-drift { to { transform: translateY(-${PITCH * HOLES_PER_LOOP}px); } }
[data-paused] .sprocket-strip { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .sprocket-strip { animation: none; } }
`;

export const SprocketEdges: React.FC = () => {
  const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.hidden);
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  return (
    <div aria-hidden="true" data-paused={hidden ? "" : undefined} className="pointer-events-none absolute inset-0 hidden lg:block overflow-hidden">
      <style>{CSS}</style>
      {["left-3", "right-3"].map((side) => (
        <div key={side} className={`sprocket-strip absolute top-0 ${side} w-[14px]`} style={{ height: `calc(100% + ${PITCH * HOLES_PER_LOOP}px)` }} />
      ))}
    </div>
  );
};
