import React, { useEffect, useMemo, useState } from "react";
import { BLUEPRINT } from "./blueprintSettings";

/**
 * Acoustic ray-tracing (md+): from a source point, rays travel in straight lines and reflect off the content
 * container's walls ("the room"). Geometry is computed once per cycle; the motion is pure CSS (stroke-dashoffset for
 * the travelling head and tail, transform/opacity for the reflection ripples), keyed by cycle so it restarts.
 */

const R = BLUEPRINT.rays;

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
interface Ray {
  d: string;
  color: string;
  /** Reflection points with the time (ms) the head reaches them. */
  hits: { x: number; y: number; at: number }[];
}

/** Trace a ray from (x, y) at `angle`, reflecting off the box walls `bounces` times. */
const trace = (box: Box, x: number, y: number, angle: number, bounces: number) => {
  let dx = Math.cos(angle);
  let dy = Math.sin(angle);
  const pts: [number, number][] = [[x, y]];
  for (let b = 0; b <= bounces; b++) {
    const tx = dx > 0 ? (box.x1 - x) / dx : dx < 0 ? (box.x0 - x) / dx : Infinity;
    const ty = dy > 0 ? (box.y1 - y) / dy : dy < 0 ? (box.y0 - y) / dy : Infinity;
    const t = Math.min(tx, ty);
    x += dx * t;
    y += dy * t;
    pts.push([x, y]);
    if (tx < ty) dx = -dx;
    else dy = -dy;
  }
  return pts;
};

const makeRays = (box: Box, seed: number): { source: [number, number]; rays: Ray[] } => {
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const w = box.x1 - box.x0;
  const h = box.y1 - box.y0;
  const sx = box.x0 + w * (0.2 + rand() * 0.6);
  const sy = box.y0 + h * (0.2 + rand() * 0.6);
  const rays: Ray[] = [];
  const base = rand() * Math.PI * 2;
  for (let i = 0; i < R.count; i++) {
    const angle = base + (i / R.count) * Math.PI * 2 + (rand() - 0.5) * 0.35;
    const bounces = R.bounces[0] + Math.round(rand() * (R.bounces[1] - R.bounces[0]));
    const pts = trace(box, sx, sy, angle, bounces);
    const segs = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]));
    const total = segs.reduce((a, b) => a + b, 0);
    let acc = 0;
    const hits = pts.slice(1, -1).map(([x, y], k) => {
      acc += segs[k];
      // The head reaches fraction f of the path at f / (1 + dash) of the travel time.
      return { x, y, at: ((acc / total) / (1 + R.dash)) * R.travelMs };
    });
    rays.push({
      d: pts.map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" "),
      color: i % 2 ? `rgba(255,90,31,${R.orangeOpacity})` : `rgba(14,59,140,${R.navyOpacity})`,
      hits,
    });
  }
  return { source: [sx, sy], rays };
};

export const RAY_CSS = `
.ab-ray-head { stroke-dasharray: ${R.dash} 2; stroke-dashoffset: ${R.dash}; animation: ab-ray-head ${R.travelMs}ms linear both; }
@keyframes ab-ray-head { to { stroke-dashoffset: -1; } }
.ab-ray-tail { stroke-dasharray: ${R.tail} 2; stroke-dashoffset: ${R.tail}; animation: ab-ray-tail ${Math.round((R.travelMs * (1 + R.tail)) / (1 + R.dash))}ms linear both; }
@keyframes ab-ray-tail { to { stroke-dashoffset: -1; } }
.ab-ripple { transform-box: fill-box; transform-origin: center; opacity: 0; animation: ab-ripple ${R.rippleMs}ms ease-out both; }
@keyframes ab-ripple { 0% { opacity: 0.9; transform: scale(0.4); } 100% { opacity: 0; transform: scale(1.6); } }
.ab-source-ring { transform-box: fill-box; transform-origin: center; animation: ab-source 2.4s ease-out infinite; }
@keyframes ab-source { 0% { opacity: 0.6; transform: scale(0.6); } 100% { opacity: 0; transform: scale(2.2); } }
.ab-rays { opacity: 0; animation: ab-in 800ms ease-out both; }
@keyframes ab-in { to { opacity: 1; } }
[data-paused] .ab-ray-head, [data-paused] .ab-ray-tail, [data-paused] .ab-ripple, [data-paused] .ab-source-ring, [data-paused] .ab-rays { animation-play-state: paused; }
`;

/** Rays inside `box` (viewport coordinates of the sticky layer). A new source/geometry every cycle while running. */
export const RayTrace: React.FC<{ box: Box | null; width: number; height: number; running: boolean }> = ({ box, width, height, running }) => {
  const [cycle, setCycle] = useState(1);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setCycle((c) => c + 1), R.cycleMs);
    return () => window.clearInterval(t);
  }, [running]);

  const scene = useMemo(() => (box ? makeRays(box, cycle) : null), [box, cycle]);
  if (!scene || !width || !height) return null;

  return (
    <svg key={cycle} className="ab-rays absolute inset-0" width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      {scene.rays.map((ray, i) => (
        <g key={i}>
          <path className="ab-ray-tail" d={ray.d} pathLength={1} stroke={ray.color} strokeOpacity={0.5} strokeWidth={1} strokeLinecap="round" />
          <path className="ab-ray-head" d={ray.d} pathLength={1} stroke={ray.color} strokeWidth={1} strokeLinecap="round" />
          {ray.hits.map((h, k) => (
            <circle key={k} className="ab-ripple" cx={h.x} cy={h.y} r={4} stroke={ray.color} strokeWidth={1} style={{ animationDelay: `${Math.round(h.at)}ms` }} />
          ))}
        </g>
      ))}
      <circle cx={scene.source[0]} cy={scene.source[1]} r={3} fill="rgba(255,90,31,0.35)" />
      <circle className="ab-source-ring" cx={scene.source[0]} cy={scene.source[1]} r={6} stroke="rgba(255,90,31,0.3)" strokeWidth={1} />
    </svg>
  );
};
