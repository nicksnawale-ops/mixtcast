import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { PatchInContext, type PatchInApi } from "./patchInContext";

/**
 * "Patch In": Who We Are → Services. A signal cable draws down from Who We Are, plugs into an input port beside the
 * Services eyebrow, and the console powers on (light wave + pulses across its routing grid, then the card cascade).
 *
 * Wraps the Services section and adds no height: everything is absolutely positioned in the page gap above it
 * (wrapper coordinates = Services section coordinates). Scroll-linked like the other Home transitions — Lenis drives
 * the native scroll, so `useScroll` follows it. Transform/opacity only; the cable is "drawn" by a vertical clip reveal
 * (it always descends), so it is never repainted while scrolling.
 */

/** Scroll progress over the cable's region at which drawing starts / completes. */
const DRAW_FROM = 0.1;
const DRAW_TO = 0.85;
/** The region's progress runs from its top entering the viewport bottom to its end reaching 35% down the viewport. */
const SCROLL_OFFSET = ["start end", "end 35%"] as const;
/** After the plug clicks in: power-on wave + pulses, then release the card cascade. */
const POWER_ON_AT = 150; // ms
const CASCADE_AT = 1000; // ms
/** Safety: if the cards are in view but the cable never completed (e.g. a jump), power on anyway. */
const FALLBACK_MS = 1500;

const BAND_MAX = 120; // white → #FAF8F5 blend
const PORT = 16; // port diameter (px)
const MOBILE_CABLE = 80; // straight drop below md
const NAVY = "#0E3B8C";
const ORANGE = "#FF5A1F";
const EASE = [0.22, 1, 0.36, 1] as const;

interface Geo {
  w: number;
  gap: number;
  /** Cable start / end (end = top of the port). */
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  /** Port centre. */
  px: number;
  py: number;
}

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

/** Points along the cable (y strictly increasing), for the reveal and the connector head. */
const cablePoints = (g: Geo, wide: boolean) => {
  const pts: [number, number][] = [];
  if (!wide) {
    pts.push([g.sx, g.sy], [g.ex, g.ey]);
    return pts;
  }
  // One S-curve: leave Who We Are straight down, sweep across, and drop into the port from above.
  const k = (g.ey - g.sy) * 0.5;
  const c1: [number, number] = [g.sx, g.sy + k];
  const c2: [number, number] = [g.ex, g.ey - k];
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    const u = 1 - t;
    pts.push([
      u * u * u * g.sx + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * g.ex,
      u * u * u * g.sy + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * g.ey,
    ]);
  }
  return pts;
};

/** Position and heading of the cable at height `y`. */
const pointAt = (pts: [number, number][], y: number) => {
  let i = 1;
  while (i < pts.length - 1 && pts[i][1] < y) i++;
  const [x0, y0] = pts[i - 1];
  const [x1, y1] = pts[i];
  const t = y1 === y0 ? 0 : Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
  return { x: x0 + (x1 - x0) * t, angle: (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI };
};

export const PatchInTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduced = !!useReducedMotion();
  const wide = useMedia("(min-width: 768px)");
  const wrapRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  // Geometry: the page gap above (layout offsets, so transforms can't skew it) and the eyebrow's text box.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const prev = wrap.previousElementSibling as HTMLElement | null;
      const gap = prev ? Math.max(0, wrap.offsetTop - (prev.offsetTop + prev.offsetHeight)) : 96;
      const eyebrow = wrap.querySelector<HTMLElement>("[data-patch-eyebrow]");
      if (!eyebrow) return;
      const range = document.createRange();
      range.selectNodeContents(eyebrow);
      const t = range.getBoundingClientRect();
      const w0 = wrap.getBoundingClientRect();
      const left = t.left - w0.left;
      const top = t.top - w0.top;
      const w = wrap.offsetWidth;
      const next: Geo = wide
        ? (() => {
            const px = Math.max(PORT / 2 + 2, left - PORT); // immediately left of the eyebrow text
            const py = top + t.height / 2;
            return { w, gap, sx: w / 2, sy: -gap + 10, ex: px, ey: py - PORT / 2 - 1, px, py };
          })()
        : (() => {
            const px = left + t.width / 2; // centred above the eyebrow text
            const py = top - 18;
            return { w, gap, sx: px, sy: py - PORT / 2 - 1 - MOBILE_CABLE, ex: px, ey: py - PORT / 2 - 1, px, py };
          })();
      setGeo((prevGeo) => (prevGeo && JSON.stringify(prevGeo) === JSON.stringify(next) ? prevGeo : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    if (wrap.previousElementSibling) observer.observe(wrap.previousElementSibling);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => observer.disconnect();
  }, [wide]);

  const pts = useMemo(() => (geo ? cablePoints(geo, wide) : []), [geo, wide]);

  // ── Power state shared with the Services section ──────────────────────────────────────────────────────────
  // Already on screen at load (or reduced motion): play as before — powered from the start, no connection moment.
  const [powered, setPowered] = useState(() => {
    if (typeof window === "undefined" || reduced) return true;
    return false;
  });
  const powerOnFn = useRef<((x: number, y: number) => void) | null>(null);
  const registerPowerOn = useCallback((fn: ((x: number, y: number) => void) | null) => {
    powerOnFn.current = fn;
  }, []);
  const api: PatchInApi = useMemo(() => ({ powered, registerPowerOn }), [powered, registerPowerOn]);

  // Before first paint, so an already-visible section never flashes dimmed.
  useLayoutEffect(() => {
    if (reduced) return setPowered(true);
    const wrap = wrapRef.current;
    if (wrap && wrap.getBoundingClientRect().top < window.innerHeight * 0.85) setPowered(true);
  }, [reduced]);

  // ── Scroll-linked drawing ─────────────────────────────────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({ target: regionRef, offset: [...SCROLL_OFFSET] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.0005 });
  const drawn = useTransform(smooth, [DRAW_FROM, DRAW_TO], [0, 1], { clamp: true });
  const span = geo ? geo.ey - geo.sy : 1;

  // Cable reveal + connector head, driven from the drawn fraction (reduced motion: fully drawn, static).
  // Updated on every change of `drawn` and whenever the geometry changes (so they're never stale).
  const revealOuter = useMotionValue(0);
  const revealInner = useMotionValue(0);
  const headX = useMotionValue(0);
  const headY = useMotionValue(0);
  const headAngle = useMotionValue(90);
  const headOpacity = useMotionValue(0);
  const update = (raw: number) => {
    if (!geo || !pts.length) return;
    const d = reduced ? 1 : raw;
    const y = geo.sy + d * span;
    revealOuter.set(d * span - span);
    revealInner.set(span - d * span);
    headX.set(pointAt(pts, y).x);
    headY.set(y);
    headAngle.set(pointAt(pts, geo.sy + Math.min(0.995, d) * span).angle);
    headOpacity.set(d > 0.01 ? 1 : 0);
  };
  useEffect(() => update(drawn.get()), [geo, pts, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Connection moment: once per page view; re-armed only when scrolled back above the start ──────────────
  const [connected, setConnected] = useState(reduced);
  const [fireSeq, setFireSeq] = useState(0);
  const armed = useRef(true);
  const timers = useRef<number[]>([]);
  const fire = () => {
    setFireSeq((n) => n + 1);
    timers.current.push(
      window.setTimeout(() => geo && powerOnFn.current?.(geo.px, geo.py), POWER_ON_AT),
      window.setTimeout(() => setPowered(true), CASCADE_AT),
    );
  };
  useMotionValueEvent(drawn, "change", (d) => {
    update(d);
    if (reduced) return;
    const isConnected = d >= 0.995;
    setConnected((c) => (c === isConnected ? c : isConnected));
    if (isConnected && armed.current) {
      armed.current = false;
      fire();
    } else if (d <= 0.001) armed.current = true;
  });
  useEffect(() => {
    // Loaded with the cable already complete (e.g. restored scroll position): no connection moment.
    if (drawn.get() >= 0.995) armed.current = false;
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Safety net: the Services section is well in view but the cable never completed → power on anyway.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || powered) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting) timer = window.setTimeout(() => setPowered(true), FALLBACK_MS);
      },
      { threshold: 0.35 },
    );
    observer.observe(wrap);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [powered]);

  // Pause the port's idle pulse while off-screen or the tab is hidden.
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let onScreen = false;
    const update = () => setRunning(onScreen && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    }, { rootMargin: "200px 0px 0px 0px" });
    observer.observe(wrap);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const bandH = geo ? Math.min(BAND_MAX, geo.gap) : 0;
  const box = geo && {
    left: Math.min(geo.sx, geo.ex) - 12,
    width: Math.abs(geo.sx - geo.ex) + 24,
    top: geo.sy,
    height: span,
  };
  const d = pts.length && box ? pts.map(([x, y], i) => `${i ? "L" : "M"}${(x - box.left).toFixed(1)} ${(y - box.top).toFixed(1)}`).join(" ") : "";

  return (
    <div ref={wrapRef} className="relative" data-paused={running ? undefined : ""}>
      <PatchInContext.Provider value={api}>{children}</PatchInContext.Provider>

      {geo && box && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20">
          <style>{PATCH_CSS}</style>
          {/* Seamless handover: white → warm off-white, covering the hard edge (incl. the section's 1px top border) */}
          <div className="absolute inset-x-0" style={{ top: -bandH, height: bandH + 1, background: "linear-gradient(to bottom, #FFFFFF, #FAF8F5)" }} />

          {/* Scroll target: the cable's region */}
          <div ref={regionRef} className="absolute inset-x-0" style={{ top: geo.sy, height: span }} />

          {/* The cable: a soft glow under a 2px navy → orange line, revealed top → bottom */}
          <motion.div className="absolute overflow-hidden will-change-transform" style={{ ...box, y: revealOuter }}>
            <motion.svg
              className="will-change-transform"
              width={box.width}
              height={box.height}
              viewBox={`0 0 ${box.width} ${box.height}`}
              fill="none"
              style={{ y: revealInner }}
            >
              <defs>
                <linearGradient id="patch-cable" gradientUnits="userSpaceOnUse" x1={geo.sx - box.left} y1={0} x2={geo.ex - box.left} y2={box.height}>
                  <stop offset="0" stopColor={NAVY} />
                  <stop offset="1" stopColor={ORANGE} />
                </linearGradient>
              </defs>
              <path d={d} stroke={ORANGE} strokeOpacity={0.12} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} stroke="url(#patch-cable)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </motion.div>

          {/* Connector head at the drawing tip; clicks into the port on connection */}
          <motion.div className="absolute left-0 top-0" style={{ x: headX, y: headY, rotate: headAngle, opacity: headOpacity }}>
            <motion.span
              key={fireSeq}
              className="absolute -left-[7px] -top-1 block w-3.5 h-2 rounded-[3px] bg-brand-navy shadow-[0_1px_3px_rgba(10,42,99,0.35)]"
              initial={false}
              animate={fireSeq ? { x: [0, 2, 0], scale: [1, 1.15, 1] } : undefined}
              transition={{ duration: 0.28, ease: EASE }}
            />
          </motion.div>

          {/* Input port, beside (md+) / above (mobile) the eyebrow — absolutely positioned, so the text never moves */}
          <div className="absolute" style={{ left: geo.px - PORT / 2, top: geo.py - PORT / 2, width: PORT, height: PORT }}>
            {connected && !reduced && <span className="patch-halo absolute inset-0 rounded-full bg-brand-navy" />}
            <span
              className={`absolute inset-0 rounded-full border-[1.5px] bg-white transition-colors duration-500 ${connected || reduced ? "border-brand-navy" : "border-[#C9CED6]"}`}
            />
            <span
              className="absolute inset-[5px] rounded-full bg-brand-navy transition-opacity duration-500"
              style={{ opacity: connected || reduced ? 1 : 0.35 }}
            />
            {fireSeq > 0 && (
              <span key={`glow-${fireSeq}`} className="patch-glow absolute inset-0 rounded-full border-2 border-brand-orange" />
            )}
            {fireSeq > 0 &&
              [0, 60, 120, 180, 240, 300].map((deg) => (
                <span key={`${fireSeq}-${deg}`} className="absolute left-1/2 top-1/2 w-0 h-0" style={{ transform: `rotate(${deg}deg)` }}>
                  <span className="patch-spark absolute -left-px w-0.5 h-1.5 rounded-full bg-brand-orange" />
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PATCH_CSS = `
@keyframes patch-spark { from { transform: translateY(-10px) scaleY(1); opacity: 1; } to { transform: translateY(-19px) scaleY(0.4); opacity: 0; } }
.patch-spark { top: 0; animation: patch-spark 300ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes patch-glow { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.9); opacity: 0; } }
.patch-glow { animation: patch-glow 700ms ease-out both; }
@keyframes patch-halo { 0%, 100% { transform: scale(1); opacity: 0.18; } 50% { transform: scale(1.7); opacity: 0; } }
.patch-halo { animation: patch-halo 2.4s ease-in-out 700ms infinite both; }
[data-paused] .patch-halo { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .patch-spark, .patch-glow, .patch-halo { animation: none !important; opacity: 0; } }
`;
