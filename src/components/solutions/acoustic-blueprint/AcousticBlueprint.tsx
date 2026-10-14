import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { SOLUTIONS } from "../../../data/solutions";
// Read-only reuse of the Home "Room Portals" floor plans (restyled here via page-scoped CSS).
import { FloorPlan } from "../../home/spaces-portal/FloorPlans";
import { BLUEPRINT } from "./blueprintSettings";
import { RAY_CSS, RayTrace } from "./RayTrace";
import { SILK_CSS, SoundSilk } from "./SoundSilk";

/**
 * Solutions page ambient background — "The Acoustic Blueprint". Decoration only: every layer is aria-hidden,
 * pointer-events: none, and sits at z-index −10 inside an isolated wrapper, so the curtain, hero, showcase and all
 * cards (opaque) stay above it; it only shows in the page gutters and between sections.
 *  1. "Sound Silk" ribbons (flowing curves; 3 / 2 / 1 by breakpoint)
 *  2. acoustic ray-tracing (md+, follows the viewport via a sticky layer, one group at a time)
 *  3. a ghost floor plan per space (md+, drawn once when its section is ~25% in view, gentle parallax)
 *  4. ambient glow (two soft radial blobs; one on mobile)
 * Reduced motion: static ribbons and static (fully drawn) floor plans only. Tuning: blueprintSettings.ts.
 */

const P = BLUEPRINT.plans;
const W = BLUEPRINT.glow;
const HEADER = 80;

const navy = (a: number) => `rgba(14,59,140,${a})`;

const CSS = `
${RAY_CSS}
${SILK_CSS}
.ab-plan svg { stroke: ${navy(P.navyOpacity)}; }
.ab-plan .fp-line { vector-effect: non-scaling-stroke; stroke-width: ${P.strokeWidth}px; stroke-dasharray: 1 1; stroke-dashoffset: 1; }
.ab-plan .fp-line:first-child { stroke: rgba(255,90,31,${P.accentOpacity}); }
.ab-plan[data-drawn] .fp-line { animation: ab-draw ${P.drawMs}ms cubic-bezier(0.45, 0, 0.2, 1) both; animation-delay: calc(var(--fp-d, 0ms) / 70 * ${P.staggerMs}); }
@keyframes ab-draw { to { stroke-dashoffset: 0; } }
.ab-blob-a { animation: ab-drift-a ${W.driftS[0]}s ease-in-out infinite alternate; }
.ab-blob-b { animation: ab-drift-b ${W.driftS[1]}s ease-in-out infinite alternate; }
@keyframes ab-drift-a { from { transform: translate(-6%, -4%); } to { transform: translate(8%, 6%); } }
@keyframes ab-drift-b { from { transform: translate(6%, 5%); } to { transform: translate(-8%, -6%); } }
[data-paused] .ab-blob-a, [data-paused] .ab-blob-b, [data-paused] .ab-plan .fp-line { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .ab-plan .fp-line { animation: none !important; stroke-dashoffset: 0; }
  .ab-blob-a, .ab-blob-b { animation: none !important; }
}
`;

const useMedia = (query: string) => {
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

interface PlanPos {
  slug: string;
  /** Plan centre (page coordinates within the wrapper) and the side it bleeds off. */
  y: number;
  side: "left" | "right";
}

/** One ghost plan, with gentle parallax (0.9× scroll speed, clamped). */
const GhostPlan: React.FC<{ plan: PlanPos; size: number; scrollY: MotionValue<number>; viewH: number; drawn: boolean; reduced: boolean }> = ({
  plan,
  size,
  scrollY,
  viewH,
  drawn,
  reduced,
}) => {
  const y = useTransform(scrollY, (s) =>
    reduced ? 0 : Math.max(-P.parallaxMax, Math.min(P.parallaxMax, (s + viewH / 2 - plan.y) * P.parallax)),
  );
  const offset = -size * P.bleed;
  return (
    <motion.div
      className="ab-plan absolute will-change-transform"
      data-drawn={drawn || reduced || undefined}
      style={{ top: plan.y - (size * 0.65) / 2, width: size, [plan.side]: offset, y }}
    >
      <FloorPlan slug={plan.slug} className="w-full h-auto" />
    </motion.div>
  );
};

export const AcousticBlueprint: React.FC<{ children: React.ReactNode; curtainOpen?: boolean }> = ({ children, curtainOpen = true }) => {
  const reduced = !!useReducedMotion();
  const wide = useMedia(`(min-width: ${P.minWidth}px)`);
  const xl = useMedia("(min-width: 1280px)");
  const lg = useMedia("(min-width: 1024px)");
  const [pageH, setPageH] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [plans, setPlans] = useState<PlanPos[]>([]);
  const [drawn, setDrawn] = useState<Record<string, boolean>>({});
  const [view, setView] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);

  // Positions of each space section (layout offsets relative to the wrapper) + the "room" for the rays.
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const w0 = wrap.getBoundingClientRect();
      setPageH(wrap.offsetHeight);
      setPlans(
        SOLUTIONS.map((sol, index) => {
          const el = document.getElementById(sol.slug);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          // Opposite the image: image on the right for even sections (lg), on the left for odd ones.
          return { slug: sol.slug, y: r.top - w0.top + r.height / 2, side: index % 2 === 1 ? "right" : "left" } as PlanPos;
        }).filter((p): p is PlanPos => !!p),
      );
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      setView({ w: vw, h: vh });
      const pad = vw >= 1024 ? 32 : vw >= 640 ? 24 : 16;
      const cw = Math.min(vw, 1280) - pad * 2;
      const x0 = (vw - cw) / 2;
      setBox({ x0, y0: HEADER + 8, x1: x0 + cw, y1: vh - 8 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // One IntersectionObserver for every section: draw its plan once ~25% of it is in view.
  useEffect(() => {
    if (reduced || !wide) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hits = entries.filter((e) => e.isIntersecting).map((e) => e.target.id);
        if (hits.length) setDrawn((d) => ({ ...d, ...Object.fromEntries(hits.map((id) => [id, true])) }));
        hits.forEach((id) => observer.unobserve(document.getElementById(id)!));
      },
      { threshold: P.triggerRatio },
    );
    SOLUTIONS.forEach((sol) => {
      const el = document.getElementById(sol.slug);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [reduced, wide]);

  // Pause every loop while the tab is hidden.
  const [visible, setVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const { scrollY, scrollYProgress } = useScroll();
  const blobShift = useTransform(scrollYProgress, [0, 1], [-W.scrollShift / 2, W.scrollShift / 2]);
  const planSize = xl ? P.width[1] : P.width[0];

  return (
    <div ref={wrapRef} className="relative isolate">
      <div aria-hidden="true" data-paused={visible ? undefined : ""} className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
        <style>{CSS}</style>

        {/* 1 · Sound Silk ribbons */}
        <SoundSilk count={lg ? 3 : wide ? 2 : 1} vw={view.w} pageH={pageH} viewH={view.h} scrollY={scrollY} curtainOpen={curtainOpen} reduced={reduced} />

        {/* 3 · Ghost floor plans (md+) */}
        {wide &&
          plans.map((plan) => (
            <GhostPlan key={plan.slug} plan={plan} size={planSize} scrollY={scrollY} viewH={view.h} drawn={!!drawn[plan.slug]} reduced={reduced} />
          ))}

        {/* 2 + 4 · Viewport-following layer: sticky inside the page, so it never reaches the footer */}
        {!reduced && (
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <motion.div className="absolute inset-0" style={{ y: wide ? blobShift : 0 }}>
              <div
                className="ab-blob-a absolute -left-[15%] top-[5%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full"
                style={{ background: `radial-gradient(closest-side, ${navy(W.navyOpacity)}, rgba(14,59,140,0))` }}
              />
              {wide && (
                <div
                  className="ab-blob-b absolute -right-[12%] bottom-[0%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full"
                  style={{ background: `radial-gradient(closest-side, rgba(255,90,31,${W.orangeOpacity}), rgba(255,90,31,0))` }}
                />
              )}
            </motion.div>
            {wide && <RayTrace box={box} width={view.w} height={view.h} running={visible} />}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};
