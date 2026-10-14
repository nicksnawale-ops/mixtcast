import React from "react";

/**
 * Abstract floor-plan line drawings, one per space type (keyed by solution slug), drawn on hover/focus.
 * 200×130 viewBox; every path has pathLength=1 so the CSS draw (stroke-dashoffset 1 → 0) works for any shape.
 */

const P: React.FC<{ d: string; i?: number }> = ({ d, i = 0 }) => (
  <path d={d} pathLength={1} className="fp-line" style={{ "--fp-d": `${i * 70}ms` } as React.CSSProperties} />
);

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y} h${w} v${h} h${-w} Z`;
const dot = (x: number, y: number, r = 3) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
/** A seating arc of radius r below (cx, cy), spanning ±60° either side of straight down. */
const seatArc = (cx: number, cy: number, r: number) => {
  const s = Math.sin(Math.PI / 3);
  const c = Math.cos(Math.PI / 3);
  return `M${(cx - r * s).toFixed(1)} ${(cy + r * c).toFixed(1)} A${r} ${r} 0 0 0 ${(cx + r * s).toFixed(1)} ${(cy + r * c).toFixed(1)}`;
};

// Auditoriums: stage + 4 concentric seating arcs + aisles.
const Auditorium = () => {
  const aisle = (side: number) => {
    const a = (side * 25 * Math.PI) / 180;
    return `M${(100 + 34 * Math.sin(a)).toFixed(1)} ${(20 + 34 * Math.cos(a)).toFixed(1)} L${(100 + 104 * Math.sin(a)).toFixed(1)} ${(20 + 104 * Math.cos(a)).toFixed(1)}`;
  };
  return (
    <>
      <P d={rect(72, 8, 56, 16)} />
      {[40, 58, 76, 94].map((r, k) => (
        <P key={r} d={seatArc(100, 20, r)} i={k + 1} />
      ))}
      <P d={`${aisle(-1)} ${aisle(1)}`} i={5} />
    </>
  );
};

// Theatres: screen + 6 straight rows with a centre aisle.
const Theatre = () => (
  <>
    <P d="M46 14 Q100 6 154 14" />
    {[34, 48, 62, 76, 90, 104].map((y, k) => (
      <P key={y} d={`M40 ${y} H92 M108 ${y} H160`} i={k + 1} />
    ))}
  </>
);

// Boardrooms: long rounded table + 8 chairs + wall display.
const Boardroom = () => (
  <>
    <P d="M70 12 H130" />
    <P d="M74 48 H126 A18 18 0 0 1 126 84 H74 A18 18 0 0 1 74 48 Z" i={1} />
    <P d={[74, 92, 110, 128].map((x) => `M${x} 38 v5 M${x} 89 v5`).join(" ")} i={2} />
  </>
);

// Classrooms: board + 3×4 desk grid.
const Classroom = () => (
  <>
    <P d="M44 12 H156" />
    {[40, 64, 88].map((y, k) => (
      <P key={y} d={[38, 72, 106, 140].map((x) => rect(x, y, 22, 10)).join(" ")} i={k + 1} />
    ))}
  </>
);

// Training centres: projection screen + U-shaped desks.
const Training = () => (
  <>
    <P d="M66 12 H134 M70 12 v5 M130 12 v5" />
    <P d="M48 36 V110 H152 V36" i={1} />
    <P d="M64 36 V94 H136 V36" i={2} />
  </>
);

// Home theatres: screen + 2 rows of 3 recliners + corner speakers.
const recliner = (x: number, y: number) => `${rect(x, y, 24, 18)} M${x} ${y + 5} h24`;
const HomeTheatre = () => (
  <>
    <P d="M52 14 H148" />
    <P d={[58, 88, 118].map((x) => recliner(x, 46)).join(" ")} i={1} />
    <P d={[58, 88, 118].map((x) => recliner(x, 78)).join(" ")} i={2} />
    <P d={[dot(22, 12), dot(178, 12), dot(22, 118), dot(178, 118)].join(" ")} i={3} />
  </>
);

// Studios: desk with 3 mics + acoustic panels on the walls.
const Studio = () => (
  <>
    <P d={rect(60, 62, 80, 20)} />
    <P d={[dot(80, 50, 5), dot(100, 46, 5), dot(120, 50, 5)].join(" ")} i={1} />
    <P d={[20, 46, 72, 98].map((y) => `M18 ${y} v16 M182 ${y} v16`).join(" ")} i={2} />
  </>
);

// Fallback: a room outline with a sound-dispersion cone.
const Fallback = () => (
  <>
    <P d={rect(30, 14, 140, 102)} />
    <P d={rect(38, 58, 10, 14)} i={1} />
    <P d="M50 65 L130 36 M50 65 L130 94" i={2} />
  </>
);

const PLANS: Record<string, React.FC> = {
  auditoriums: Auditorium,
  "commercial-theatres": Theatre,
  "conference-boardrooms": Boardroom,
  "educational-institutions": Classroom,
  "training-centers": Training,
  "residential-home-theatres": HomeTheatre,
  "podcast-chroma-studios": Studio,
};

export const FloorPlan: React.FC<{ slug: string; className?: string }> = ({ slug, className = "" }) => {
  const Plan = PLANS[slug] ?? Fallback;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 130"
      fill="none"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <Plan />
    </svg>
  );
};
