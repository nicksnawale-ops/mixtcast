import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { BLUEPRINT } from "./blueprintSettings";

/**
 * "Sound Silk": a few flowing ribbons of fine parallel curves behind the Solutions page. Each ribbon's curves follow
 * one long sine-like path whose spread follows a cosine — they converge, cross (a gentle twist) and fan apart, like
 * silk. Paths are generated once per width (deterministic, no runtime morphing) with a period of PERIOD × viewport
 * width and tiled twice, so a translateX loop is seamless. Motion is transform/opacity only.
 */

const S = BLUEPRINT.silk;

interface RibbonSpec {
  /** Vertical position as a fraction of the page height (or px from the top when ≥ 1). */
  at: number;
  driftS: number;
  reverse: boolean;
  parallax: number; // scroll-rate (0.85–0.95)
  phase: number; // breathing phase offset (s)
  seed: number;
}

export const SILK_CSS = `
.ss-drift { animation: ss-drift var(--ss-drift) linear infinite; }
.ss-drift[data-reverse] { animation-direction: reverse; }
@keyframes ss-drift { from { transform: translateX(0); } to { transform: translateX(calc(-1 * var(--ss-period))); } }
.ss-breathe { animation: ss-breathe ${S.breatheS}s ease-in-out var(--ss-phase) infinite alternate; transform-origin: center; }
@keyframes ss-breathe { from { transform: scaleY(${S.breathe[0]}); } to { transform: scaleY(${S.breathe[1]}); } }
.ss-ribbon { transition: opacity ${S.curtainFadeMs}ms ease-out; }
[data-paused] .ss-drift, [data-paused] .ss-breathe, .ss-ribbon[data-off] .ss-drift, .ss-ribbon[data-off] .ss-breathe { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .ss-drift, .ss-breathe { animation: none !important; } }
`;

/** One ribbon's curve paths across two periods (so it can loop). */
const ribbonPaths = (period: number, height: number, seed: number) => {
  const mid = height / 2;
  const k = (2 * Math.PI) / period;
  const p1 = seed * 1.7;
  const p2 = seed * 2.9;
  const p3 = seed * 0.6;
  const n = S.curves;
  const step = 14;
  const width = period * 2;
  const paths: string[] = [];
  for (let i = 0; i < n; i++) {
    const o = i - (n - 1) / 2;
    let d = "";
    for (let x = 0; x <= width; x += step) {
      // Long-wavelength body + a softer second harmonic; the cosine spread makes the curves converge and twist.
      const y = mid + S.amplitude * Math.sin(k * x + p1) + S.amplitude * 0.35 * Math.sin(2 * k * x + p2) + o * S.spread * Math.cos(k * x + p3);
      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)} `;
    }
    paths.push(d.trim());
  }
  return paths;
};

const Ribbon: React.FC<{
  spec: RibbonSpec;
  index: number;
  vw: number;
  pageH: number;
  viewH: number;
  scrollY: MotionValue<number>;
  visible: boolean;
  reduced: boolean;
  register: (el: HTMLDivElement | null) => void;
  off: boolean;
}> = ({ spec, index, vw, pageH, viewH, scrollY, visible, reduced, register, off }) => {
  const period = Math.round(vw * S.period);
  const height = S.height;
  const paths = useMemo(() => ribbonPaths(period, height, spec.seed), [period, height, spec.seed]);
  const top = (spec.at >= 1 ? spec.at : pageH * spec.at) - height / 2;
  const y = useTransform(scrollY, (s) =>
    reduced ? 0 : Math.max(-S.parallaxMax, Math.min(S.parallaxMax, (s + viewH / 2 - (top + height / 2)) * (1 - spec.parallax))),
  );
  const gid = `ss-grad-${index}`;
  const animating = !reduced && !off;

  return (
    <motion.div
      ref={register}
      data-off={off || undefined}
      className="ss-ribbon absolute left-0 w-full"
      style={{
        top,
        height,
        y,
        opacity: visible ? 1 : 0,
        // Softest toward the middle of the page (behind the content column), strongest in the margins.
        maskImage: "radial-gradient(ellipse 42% 90% at 50% 50%, rgba(0,0,0,0.35), #000)",
        WebkitMaskImage: "radial-gradient(ellipse 42% 90% at 50% 50%, rgba(0,0,0,0.35), #000)",
      }}
    >
      <div className="ss-breathe absolute inset-0" style={{ ["--ss-phase" as string]: `${-spec.phase}s`, willChange: animating ? "transform" : undefined }}>
        <svg
          className="ss-drift absolute left-0 top-0"
          data-reverse={spec.reverse || undefined}
          width={period * 2}
          height={height}
          viewBox={`0 0 ${period * 2} ${height}`}
          fill="none"
          style={{
            ["--ss-drift" as string]: `${spec.driftS}s`,
            ["--ss-period" as string]: `${period}px`,
            opacity: vw < 768 ? S.mobileOpacity : S.opacity,
            willChange: animating ? "transform" : undefined,
          }}
        >
          <defs>
            {/* Repeats every period, so the colour flow is seamless too: transparent → navy → orange → navy → transparent */}
            <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={period} y2="0" spreadMethod="repeat">
              <stop offset="0" stopColor="#0E3B8C" stopOpacity={0} />
              <stop offset="0.22" stopColor="#0E3B8C" stopOpacity={1} />
              <stop offset="0.42" stopColor="#FF5A1F" stopOpacity={0.9} />
              <stop offset="0.58" stopColor="#FF5A1F" stopOpacity={0.9} />
              <stop offset="0.78" stopColor="#0E3B8C" stopOpacity={1} />
              <stop offset="1" stopColor="#0E3B8C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <g stroke={`url(#${gid})`} strokeLinecap="round">
            {paths.map((d, i) => (
              <path key={i} d={d} strokeWidth={i % 3 === 0 ? 1 : 0.75} />
            ))}
          </g>
          {/* Silk sheen: one curve, brighter */}
          <path d={paths[Math.floor(paths.length * 0.35)]} stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  );
};

/** All ribbons for the current breakpoint; one IntersectionObserver pauses those off-screen. */
export const SoundSilk: React.FC<{
  count: number;
  vw: number;
  pageH: number;
  viewH: number;
  scrollY: MotionValue<number>;
  curtainOpen: boolean;
  reduced: boolean;
}> = ({ count, vw, pageH, viewH, scrollY, curtainOpen, reduced }) => {
  const specs = S.ribbons[count === 3 ? "three" : count === 2 ? "two" : "one"];
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const [off, setOff] = useState<boolean[]>(() => specs.map(() => false));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        setOff((prev) => {
          const next = [...prev];
          entries.forEach((e) => {
            const i = els.current.indexOf(e.target as HTMLDivElement);
            if (i >= 0) next[i] = !e.isIntersecting;
          });
          return next;
        }),
      { rootMargin: "200px 0px" },
    );
    els.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [specs, vw, pageH]);

  if (!vw || !pageH) return null;
  return (
    <>
      {specs.map((spec, i) => (
        <Ribbon
          key={`${count}-${i}`}
          spec={spec}
          index={i}
          vw={vw}
          pageH={pageH}
          viewH={viewH}
          scrollY={scrollY}
          // The top ribbon waits for the curtain to open (immediately when it's skipped).
          visible={i > 0 || curtainOpen || reduced}
          reduced={reduced}
          off={!!off[i]}
          register={(el) => {
            els.current[i] = el;
          }}
        />
      ))}
    </>
  );
};
