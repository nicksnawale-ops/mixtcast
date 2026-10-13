import React from "react";

/**
 * Line-art pictograms for the five stages (96×96 viewBox, 1.5px strokes, navy with orange accents).
 * Pure CSS animation (stroke-dashoffset / opacity / a few short scale pops): animating SVG attributes from JS
 * every frame forced a layout per frame. The svg's classes drive everything:
 *  - `pg-play`: draw in (remount with a new `key` to redraw);
 *  - `pg-loop`: small idle loops (only while the stage is current and the section is on-screen);
 *  - `pg-static`: final drawn state, no animation (reduced motion).
 */

const NAVY = "#0E3B8C";
const ORANGE = "#FF5A1F";

export const PICTOGRAM_CSS = `
.pg .pg-draw { stroke-dasharray: 1 1; stroke-dashoffset: 1; }
.pg-play .pg-draw { animation: pg-draw var(--t, 0.7s) cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0s) both; }
@keyframes pg-draw { from { stroke-dashoffset: 1; opacity: 1; } to { stroke-dashoffset: 0; opacity: var(--o, 1); } }
.pg .pg-fade { opacity: 0; }
.pg-play .pg-fade { animation: pg-fade 0.35s ease-out var(--d, 0s) both; }
@keyframes pg-fade { from { opacity: 0; } to { opacity: var(--o, 1); } }
.pg .pg-pop { opacity: 0; transform-box: fill-box; transform-origin: center; }
.pg-play .pg-pop { animation: pg-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0s) both; }
@keyframes pg-pop { 0% { opacity: 0; transform: scale(0.4); } 55% { opacity: 1; transform: scale(1.35); } 100% { opacity: 1; transform: scale(1); } }
.pg-play .pg-fadeout { animation: pg-fadeout 0.45s ease-in var(--d, 0s) both; }
@keyframes pg-fadeout { from { opacity: 1; } to { opacity: 0; } }
/* Idle loops (declared after the one-shot rules so they take over) */
.pg-loop .pg-pulse { animation: pg-fade 0.35s ease-out var(--d, 0s) both, pg-pulse 1.8s ease-in-out calc(var(--d, 0s) + 0.35s) infinite; }
@keyframes pg-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
.pg-loop .pg-cone { animation: pg-sweep 4.5s ease-in-out calc(var(--d, 0s) + var(--k) * 1.5s) infinite both; }
@keyframes pg-sweep { 0%, 100% { opacity: 0; } 12%, 33% { opacity: 1; } 45% { opacity: 0; } }
.pg-loop .pg-beat { animation: pg-beat 2.4s ease-in-out var(--d, 0s) infinite both; }
@keyframes pg-beat { 0% { stroke-dashoffset: 1; opacity: 1; } 60% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
.pg-static .pg-draw, .pg-static .pg-fade, .pg-static .pg-pop, .pg-static .pg-pulse, .pg-static .pg-beat { animation: none; stroke-dasharray: none; stroke-dashoffset: 0; opacity: var(--o, 1); transform: none; }
.pg-static .pg-fadeout { animation: none; opacity: 0; }
.pg-static .pg-cone { animation: none; }
[data-paused] .pg * { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .pg * { animation: none !important; } }
`;

const v = (vars: Record<string, string | number>) => vars as React.CSSProperties;

/** A path that draws itself in. */
const Draw: React.FC<{ d: string; delay?: number; duration?: number; stroke?: string; width?: number; opacity?: number; className?: string }> = ({
  d,
  delay = 0,
  duration = 0.7,
  stroke = NAVY,
  width = 1.5,
  opacity = 1,
  className = "pg-draw",
}) => (
  <path
    d={d}
    pathLength={1}
    fill="none"
    stroke={stroke}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={v({ "--d": `${delay}s`, "--t": `${duration}s`, "--o": opacity })}
  />
);

/** Pops an element in after `delay`. */
const Pop: React.FC<{ delay: number; children: React.ReactNode }> = ({ delay, children }) => (
  <g className="pg-pop" style={v({ "--d": `${delay}s` })}>
    {children}
  </g>
);

// 1 · Consult & Understand — a room being measured, an ear listening.
const dashes = (x1: number, y1: number, x2: number, y2: number, dash = 3.5, gap = 3) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  let d = "";
  for (let s = 0; s < len; s += dash + gap) {
    const e = Math.min(len, s + dash);
    d += `M${(x1 + ux * s).toFixed(1)} ${(y1 + uy * s).toFixed(1)} L${(x1 + ux * e).toFixed(1)} ${(y1 + uy * e).toFixed(1)} `;
  }
  return d.trim();
};

const Consult: React.FC = () => (
  <>
    <Draw d="M40 74 H22 V26 H78 V74 H56" duration={0.8} />
    <Draw d={`${dashes(22, 16, 78, 16)} M22 13 V19 M78 13 V19`} stroke={ORANGE} width={1.25} delay={0.45} duration={0.6} />
    <Draw d={`${dashes(12, 26, 12, 74)} M9 26 H15 M9 74 H15`} stroke={ORANGE} width={1.25} delay={0.6} duration={0.6} />
    <Draw d="M45 47 a6.5 6.5 0 1 1 11 4.6 c-2 1.9 -3 3 -3 5.6 a3.2 3.2 0 0 1 -5.6 1.4" delay={0.8} duration={0.6} />
    <g className="pg-fade pg-pulse" style={v({ "--d": "1.2s" })}>
      <path d="M62 43 a8 8 0 0 1 0 11" fill="none" stroke={ORANGE} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M66.5 39 a14 14 0 0 1 0 19" fill="none" stroke={ORANGE} strokeWidth={1.5} strokeLinecap="round" opacity={0.6} />
    </g>
  </>
);

// 2 · Design & Engineer — a blueprint grid, a speaker's dispersion cone sweeping across the seats.
const GRID = [24, 36, 48, 60, 72].map((x) => `M${x} 14 V82 M14 ${x} H82`).join(" ");
const SEATS = [58, 66, 74].flatMap((x) => [34, 42, 50, 58, 66].map((y) => [x, y] as const));
const CONE_ANGLES = [-14, 0, 12];

const Design: React.FC = () => (
  <>
    <Draw d={GRID} width={0.75} opacity={0.18} duration={0.9} />
    <Draw d="M15 38 h12 a2 2 0 0 1 2 2 v16 a2 2 0 0 1 -2 2 h-12 a2 2 0 0 1 -2 -2 v-16 a2 2 0 0 1 2 -2 Z M21 44 a3 3 0 1 0 0.01 0 M21 52 a1.6 1.6 0 1 0 0.01 0" delay={0.2} />
    {/* The sweep is a cross-fade between three fixed angles (opacity only) */}
    {CONE_ANGLES.map((angle, k) => (
      <g key={angle} className="pg-fade pg-cone" style={v({ "--d": "0.6s", "--k": k, "--o": k === 1 ? 1 : 0 })}>
        <path
          d="M30 48 L84 30 L84 66 Z"
          transform={`rotate(${angle} 30 48)`}
          fill={ORANGE}
          fillOpacity={0.12}
          stroke={ORANGE}
          strokeOpacity={0.7}
          strokeWidth={1.25}
          strokeLinejoin="round"
        />
      </g>
    ))}
    {SEATS.map(([x, y], i) => (
      <Pop key={`${x}-${y}`} delay={0.5 + i * 0.03}>
        <circle cx={x} cy={y} r={1.6} fill={NAVY} />
      </Pop>
    ))}
  </>
);

// 3 · Supply & Integrate — three devices, cabled together; a spark as each plug clicks home.
const Integrate: React.FC = () => (
  <>
    <Draw d="M10 18 H36 V38 H10 Z M15 28 H24" duration={0.5} />
    <Draw d="M60 18 H86 V38 H60 Z M72 28 H81" delay={0.12} duration={0.5} />
    <Draw d="M35 60 H61 V80 H35 Z M41 70 H50" delay={0.24} duration={0.5} />
    <Draw d="M36 31 C46 31 50 31 60 31" delay={0.6} duration={0.45} />
    <Draw d="M23 38 C23 55 28 64 35 66" delay={0.85} duration={0.45} />
    <Draw d="M73 38 C73 55 68 64 61 66" delay={1.1} duration={0.45} />
    {[
      [60, 31, 1.05],
      [35, 66, 1.3],
      [61, 66, 1.55],
    ].map(([x, y, delay]) => (
      <Pop key={`${x}-${y}`} delay={delay}>
        <circle cx={x} cy={y} r={2.4} fill={ORANGE} />
        <path d={`M${x - 5} ${y - 5} l2 2 M${x + 5} ${y - 5} l-2 2 M${x} ${y - 7} v2.5`} stroke={ORANGE} strokeWidth={1.1} strokeLinecap="round" />
      </Pop>
    ))}
  </>
);

// 4 · Test & Commission — a jagged frequency response settles into a flat, balanced line. ✓
const Commission: React.FC = () => (
  <>
    <Draw d="M14 16 V80 H86" duration={0.5} />
    <g className="pg-fadeout" style={v({ "--d": "1.0s" })}>
      <Draw d="M18 50 L24 36 L30 62 L36 32 L42 60 L48 40 L54 64 L60 42 L66 58 L72 44 L80 51" delay={0.3} duration={0.6} />
    </g>
    <Draw d="M18 50 C30 48 40 52 50 49.5 S70 50.5 82 50" stroke={ORANGE} width={1.75} delay={1.1} duration={0.6} />
    <Draw d="M64 24 L69.5 29.5 L80 19" stroke={ORANGE} width={1.75} delay={1.6} duration={0.35} />
  </>
);

// 5 · Train & Support — an operator at the console; a steady live pulse.
const Support: React.FC = () => (
  <>
    <Draw d="M30 18 a7 7 0 1 1 -0.01 0 Z" duration={0.5} />
    <Draw d="M17 46 C17 37 43 37 43 46" delay={0.15} duration={0.5} />
    <Draw d="M8 76 L14 54 H58 L64 76 Z" delay={0.3} duration={0.6} />
    <Draw d="M22 60 V70 M30 60 V70 M38 60 V70 M46 60 V70" width={1.25} delay={0.6} duration={0.4} />
    {[
      [22, 63],
      [30, 67],
      [38, 62],
      [46, 66],
    ].map(([x, y], i) => (
      <Pop key={x} delay={0.8 + i * 0.06}>
        <rect x={x - 2.5} y={y - 1.5} width={5} height={3} rx={1} fill={ORANGE} />
      </Pop>
    ))}
    <Draw d="M60 36 H67 L70 28 L74.5 44 L78 30 L80.5 36 H90" stroke={ORANGE} delay={0.9} duration={0.8} className="pg-draw pg-beat" />
  </>
);

const STAGES = [Consult, Design, Integrate, Commission, Support];

interface PictogramProps {
  stage: number;
  play: boolean;
  loop: boolean;
  reduced: boolean;
  size?: number;
  className?: string;
}

export const Pictogram: React.FC<PictogramProps> = ({ stage, play, loop, reduced, size = 96, className = "" }) => {
  const Art = STAGES[stage - 1];
  const state = reduced ? "pg-static" : `${play ? "pg-play" : ""} ${play && loop ? "pg-loop" : ""}`;
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 96 96" fill="none" className={`pg ${state} shrink-0 overflow-visible ${className}`}>
      <Art />
    </svg>
  );
};
