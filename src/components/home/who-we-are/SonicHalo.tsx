import React from "react";
import { motion, type MotionValue } from "motion/react";

interface SonicHaloProps {
  /** Becomes true once the photo's projector reveal has finished. */
  started: boolean;
  reduced: boolean;
  isDesktop: boolean;
  /** Photo frame size (px) — the ripples and orbit are shaped around it. */
  frame: { w: number; h: number };
  /** Mouse parallax (opposite to the image tilt), desktop only. */
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
}

/** Spread of the halo beyond the photo frame (px). */
const SPREAD = 40;

// Orbit nodes: periods are 12 / 18 / 36 s, so all three line up at the same point every 36 s.
const NODES = [
  { period: 12, className: "bg-brand-navy" },
  { period: 18, className: "bg-brand-orange" },
  { period: 36, className: "bg-[#9AA3AF]" },
];

/**
 * Ambient "sonic halo" behind the Who We Are photo: an aurora glow, sound ripples radiating from the frame,
 * and a dotted orbit where three nodes converge. Decorative only — CSS transform/opacity loops that pause
 * with the section's other idle animations (`.wwa-idle`).
 */
export const SonicHalo: React.FC<SonicHaloProps> = ({ started, reduced, isDesktop, frame, parallaxX, parallaxY }) => {
  const animated = !reduced;
  const loop = (name: string) => (animated ? `${name} wwa-idle` : "");
  const ripples = isDesktop ? [0, 1.5, 3, 4.5] : [0];
  const orbit = { w: frame.w + SPREAD * 1.2, h: frame.h + SPREAD * 1.1 };

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute z-0"
      style={{
        inset: -SPREAD,
        x: isDesktop ? parallaxX : 0,
        y: isDesktop ? parallaxY : 0,
      }}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: started || reduced ? 1 : 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      {/* Aurora: two soft, slowly drifting glows (gradients — no large blur filters) */}
      <div
        className={`absolute left-[-6%] top-[-4%] w-[70%] h-[75%] rounded-full ${loop("wwa-drift-a")}`}
        style={{ background: "radial-gradient(closest-side, rgba(14,59,140,0.10), rgba(14,59,140,0))", willChange: "transform" }}
      />
      <div
        className={`absolute right-[-8%] bottom-[-6%] w-[65%] h-[70%] rounded-full ${loop("wwa-drift-b")}`}
        style={{ background: "radial-gradient(closest-side, rgba(255,90,31,0.08), rgba(255,90,31,0))", willChange: "transform" }}
      />

      {/* Sound ripples radiating from behind the frame */}
      {started &&
        ripples.map((delay, i) => (
          <span
            key={i}
            className={`absolute rounded-3xl border ${i % 2 ? "border-brand-orange/15" : "border-brand-navy/15"} ${loop("wwa-ripple")}`}
            style={{ inset: SPREAD, animationDelay: `${delay}s`, opacity: animated ? 0 : 0.6 }}
          />
        ))}

      {/* Convergence orbit (desktop): dotted ellipse with three gliding nodes */}
      {isDesktop && frame.w > 0 && (
        <div
          className="absolute left-1/2 top-1/2"
          style={{ width: orbit.w, height: orbit.h, marginLeft: -orbit.w / 2, marginTop: -orbit.h / 2 }}
        >
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox={`0 0 ${orbit.w} ${orbit.h}`} fill="none">
            <ellipse
              cx={orbit.w / 2}
              cy={orbit.h / 2}
              rx={orbit.w / 2}
              ry={orbit.h / 2}
              stroke="rgba(14,59,140,0.18)"
              strokeWidth="1"
              strokeDasharray="1.5 7"
              strokeLinecap="round"
            />
          </svg>
          {/* A circle of radius w/2, squashed vertically into the ellipse */}
          <div className="absolute inset-x-0 top-1/2 h-0" style={{ transform: `scaleY(${orbit.h / orbit.w})` }}>
            {NODES.map((node) => (
              <div
                key={node.period}
                className={`absolute inset-x-0 top-0 h-0 ${loop("wwa-spin")}`}
                style={{ animationDuration: `${node.period}s` }}
              >
                <span
                  className={`absolute left-full top-0 w-1.5 h-1.5 rounded-full ${node.className}`}
                  style={{ transform: `translate(-50%, -50%) scaleY(${orbit.w / orbit.h})` }}
                />
              </div>
            ))}
            {/* Soft flash where the nodes align (every 36 s) */}
            {animated && (
              <span
                className="wwa-flash wwa-idle absolute left-full top-0 w-4 h-4 rounded-full"
                style={{ background: "radial-gradient(closest-side, rgba(255,140,80,0.6), rgba(255,140,80,0))" }}
              />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
