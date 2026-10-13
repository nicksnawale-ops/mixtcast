import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

/**
 * "Site Survey Scan": Spaces → Methodology. A laser survey beam sweeps down across the boundary, revealing the
 * Methodology blueprint grid (via the grid's `--ps-scan` hook) and dimension ticks, then collapses into a point that
 * glides to the start of the Silence-to-Signal waveform — just before that section pins.
 *
 * Wraps the Methodology section and adds no height: overlays are absolutely positioned (wrapper coordinates =
 * Methodology section coordinates). Scroll-linked like the other Home transitions (Lenis drives the native scroll,
 * so `useScroll` follows it). Transform/opacity only; it reads the waveform's position but never touches it.
 */

// ── Tuning ──────────────────────────────────────────────────────────────────────────────────────────────────
/** Scroll window: the region's top (in the lower part of Spaces) at the viewport bottom → its end (the Methodology
 *  heading) 45% down the viewport. Every range below is a fraction of it. */
const SCROLL_OFFSET = ["start end", "end 45%"] as const;
const SWEEP: [number, number] = [0.15, 0.85]; // beam travels top → bottom
const ARROWS: [number, number] = [0.84, 0.88]; // dimension lines + arrowheads appear
const TICKS_OUT: [number, number] = [0.9, 1]; // ticks fade out as the heading enters
const COLLAPSE: [number, number] = [0.85, 0.91]; // beam narrows to a point at the waveform's start x
const GLIDE: [number, number] = [0.91, 0.98]; // the point glides to the waveform's start
const FADE: [number, number] = [0.97, 1]; // …and fades into it (one-off ripple)
/** How far up into Spaces the scan starts (px, at most 35% of that section). */
const START_IN_SPACES = 260;
/** Standard Home rhythm: previous content → next section's eyebrow (128px gap + 80px padding). */
const RHYTHM = 208;
const MIN_GAP = 32;
const SEAM = 140; // soft white → cool-tint seam
const TICK_STEP = 24;

const ORANGE = "#FF5A1F";

interface Geo {
  w: number;
  /** Content edges (from the Spaces section's padded box). */
  left: number;
  right: number;
  /** Beam start / end y (end = a little above the Methodology header). */
  ys: number;
  ye: number;
  /** Methodology header (eyebrow) top. */
  headTop: number;
  /** White gap above the section (after spacing) and the seam's extent. */
  gap: number;
  /** Start of the Silence-to-Signal waveform (null if it can't be measured). */
  sx: number | null;
  sy: number | null;
  sectionH: number;
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

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const range = (v: number, [a, b]: [number, number]) => Math.min(1, Math.max(0, (v - a) / (b - a)));

export const SurveyScanTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduced = !!useReducedMotion();
  const wide = useMedia("(min-width: 768px)");
  const wrapRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [spacing, setSpacing] = useState(0); // ≤ 0: trims the white gap above the section
  const spacingRef = useRef(0);

  // ── Measure (layout boxes; skipped while the Methodology stage is pinned, when it isn't at its rest position) ──
  const measure = () => {
    const wrap = wrapRef.current;
    const section = wrap?.firstElementChild as HTMLElement | null;
    const prev = wrap?.previousElementSibling as HTMLElement | null;
    if (!wrap || !section || !prev) return;
    const wr = wrap.getBoundingClientRect();
    if (wr.top < 80) return; // pinned or scrolled past: the sticky stage isn't at its rest position
    const heading = section.querySelector("h2");
    const header = heading?.parentElement;
    if (!header) return;
    const headTop = header.getBoundingClientRect().top - wr.top;

    // Spacing: trim the white gap so cards → eyebrow matches the standard rhythm (never below MIN_GAP).
    const natural = wrap.offsetTop - (prev.offsetTop + prev.offsetHeight) - spacingRef.current;
    const gap = Math.min(natural, Math.max(MIN_GAP, RHYTHM - headTop));
    const trim = Math.round(gap - natural);
    const nextSpacing = Math.abs(trim) < 8 ? 0 : trim; // ignore rounding-level differences
    if (nextSpacing !== spacingRef.current) {
      spacingRef.current = nextSpacing;
      setSpacing(nextSpacing);
      return; // re-measure after the new layout
    }

    const pr = prev.getBoundingClientRect();
    const ps = getComputedStyle(prev);
    const left = pr.left - wr.left + parseFloat(ps.paddingLeft);
    const right = pr.right - wr.left - parseFloat(ps.paddingRight);

    // Waveform start: the first point of its dashed guide path (horizontal on lg+, vertical below).
    let sx: number | null = null;
    let sy: number | null = null;
    const guide = section.querySelector<SVGPathElement>('path[stroke-dasharray="3 6"]');
    const svg = guide?.ownerSVGElement;
    if (guide && svg) {
      const p = guide.getPointAtLength(0);
      const r = svg.getBoundingClientRect();
      sx = r.left - wr.left + p.x;
      sy = r.top - wr.top + p.y;
    }

    const ys = -gap - Math.min(START_IN_SPACES, prev.offsetHeight * 0.35);
    const next: Geo = { w: wrap.offsetWidth, left, right, ys, ye: headTop - 16, headTop, gap, sx, sy, sectionH: section.offsetHeight };
    setGeo((g) => (g && JSON.stringify(g) === JSON.stringify(next) ? g : next));
  };

  useLayoutEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(wrap);
    if (wrap.previousElementSibling) observer.observe(wrap.previousElementSibling);
    // Re-measure as the boundary approaches (late-rendered pieces such as the waveform guide) and once fonts settle.
    const near = new IntersectionObserver(([e]) => e.isIntersecting && measure(), { rootMargin: "800px 0px 0px 0px" });
    near.observe(wrap);
    document.fonts?.ready.then(() => measure()).catch(() => {});
    return () => {
      observer.disconnect();
      near.disconnect();
    };
  }, [wide]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll-linked progress ────────────────────────────────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({ target: regionRef, offset: [...SCROLL_OFFSET] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.0005 });

  const beamY = useMotionValue(0);
  const beamScale = useMotionValue(1);
  const beamOpacity = useMotionValue(0);
  const capL = useMotionValue(0);
  const capR = useMotionValue(0);
  const pointX = useMotionValue(0);
  const pointY = useMotionValue(0);
  const pointOpacity = useMotionValue(0);
  const tickClip = useMotionValue(0);
  const ticksOpacity = useMotionValue(0);
  const arrowsOpacity = useMotionValue(0);
  const tickInner = useTransform(tickClip, (v) => -v);
  const [ripple, setRipple] = useState(0);
  const rippleArmed = useRef(true);

  const gridEl = useRef<HTMLElement | null>(null);
  const apply = (v: number) => {
    if (reduced) return;
    if (!geo) return measure(); // e.g. loaded already past the section: measure once it's back at rest
    const s = range(v, SWEEP);
    const c = range(v, COLLAPSE);
    const g = range(v, GLIDE);
    const f = range(v, FADE);
    const y = lerp(geo.ys, geo.ye, s);
    const tx = geo.sx ?? geo.left;
    const ty = geo.sy ?? geo.ye;

    beamY.set(y);
    beamScale.set(1 - c);
    beamOpacity.set(v < SWEEP[0] - 0.03 ? 0 : Math.min(1, (v - (SWEEP[0] - 0.03)) / 0.03) * (c < 1 ? 1 : 0));
    capL.set(lerp(geo.left, tx, c));
    capR.set(lerp(geo.right, tx, c));
    pointX.set(tx);
    pointY.set(lerp(geo.ye, ty, g));
    pointOpacity.set(c < 0.9 ? 0 : 1 - f);

    // Ticks: revealed behind the beam; arrows when the scan finishes; out as the heading enters.
    tickClip.set(Math.max(0, geo.ye - geo.ys - (y - geo.ys)));
    arrowsOpacity.set(range(v, ARROWS));
    ticksOpacity.set(v < SWEEP[0] ? 0 : 1 - range(v, TICKS_OUT));

    // The Methodology grid: visible only above the beam, then fully once the scan hands over.
    const grid = gridEl.current;
    if (grid) {
      if (v >= 1) {
        grid.style.removeProperty("--ps-scan");
        grid.removeAttribute("data-scanning");
      } else {
        const scan = v < COLLAPSE[0] ? Math.max(0, y) : lerp(geo.ye, geo.sectionH, range(v, [COLLAPSE[0], 1]));
        grid.style.setProperty("--ps-scan", `${scan}px`);
        grid.setAttribute("data-scanning", "");
      }
    }

    if (v >= 0.99 && rippleArmed.current) {
      rippleArmed.current = false;
      setRipple((n) => n + 1);
    } else if (v < 0.9) rippleArmed.current = true;
  };
  useMotionValueEvent(p, "change", apply);

  // Hook up the grid element; initial state; restore the grid untouched on unmount / reduced motion.
  useEffect(() => {
    const section = wrapRef.current?.firstElementChild as HTMLElement | null;
    gridEl.current = section?.querySelector<HTMLElement>("[data-ps-grid]") ?? null;
    if (reduced) {
      gridEl.current?.style.removeProperty("--ps-scan");
      gridEl.current?.removeAttribute("data-scanning");
    } else apply(p.get());
    const grid = gridEl.current;
    return () => {
      grid?.style.removeProperty("--ps-scan");
      grid?.removeAttribute("data-scanning");
    };
  }, [geo, reduced, wide]); // eslint-disable-line react-hooks/exhaustive-deps

  const ticks = useMemo(() => {
    if (!geo) return "";
    const h = geo.ye - geo.ys;
    let d = "";
    for (let i = 0, y = 0; y <= h; i++, y += TICK_STEP) d += `M0 ${y.toFixed(1)} H${i % 4 === 0 ? 12 : 6} `;
    return d;
  }, [geo]);

  const seamTop = geo ? -Math.min(SEAM, geo.gap) : 0;
  const seamBottom = geo ? Math.max(1, Math.min(SEAM - geo.gap, geo.headTop - 24)) : 1;
  const showScan = !reduced && geo;
  const tickH = geo ? geo.ye - geo.ys : 0;

  return (
    <div ref={wrapRef} className="relative" style={spacing ? { marginTop: spacing } : undefined}>
      {children}

      {geo && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20">
          <style>{SCAN_CSS}</style>
          {/* Clean seam: white → the Methodology cool tint, covering the hard edge (and the 1px top border) */}
          <div
            className="absolute inset-x-0"
            style={{ top: seamTop, height: seamBottom - seamTop, background: "linear-gradient(to bottom, rgba(243,246,251,0), #F3F6FB)" }}
          />

          {/* Scroll target: the scan's region */}
          <div ref={regionRef} className="absolute inset-x-0" style={{ top: geo.ys, height: geo.headTop - geo.ys }} />

          {showScan && (
            <>
              {/* Dimension ticks on both content edges (md+), revealed behind the beam */}
              {wide &&
                [
                  { x: geo.left - 16, flip: true },
                  { x: geo.right + 4, flip: false },
                ].map(({ x, flip }) => (
                  <motion.div key={x} className="absolute" style={{ left: x, top: geo.ys, width: 12, height: tickH, opacity: ticksOpacity }}>
                    <motion.div className="absolute inset-0 overflow-hidden will-change-transform" style={{ y: tickInner }}>
                      <motion.svg
                        width={12}
                        height={tickH}
                        viewBox={`0 0 12 ${tickH}`}
                        fill="none"
                        className="will-change-transform"
                        style={{ y: tickClip, scaleX: flip ? -1 : 1 }}
                      >
                        <path d={ticks} stroke="rgba(14,59,140,0.3)" strokeWidth={1} />
                      </motion.svg>
                    </motion.div>
                    {/* Dimension line with arrowheads, once the scan has finished */}
                    <motion.svg
                      className="absolute top-0 overflow-visible"
                      style={{ opacity: arrowsOpacity, [flip ? "right" : "left"]: 0 }}
                      width={6}
                      height={tickH}
                      viewBox={`0 0 6 ${tickH}`}
                      fill="none"
                    >
                      <path d={`M3 1 V${tickH - 1} M0.5 4.5 L3 1 L5.5 4.5 M0.5 ${tickH - 4.5} L3 ${tickH - 1} L5.5 ${tickH - 4.5}`} stroke="rgba(14,59,140,0.3)" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  </motion.div>
                ))}

              {/* The beam: light wash above, soft glow, 1.5px line — narrows toward the waveform's start */}
              <motion.div className="absolute left-0 top-0 will-change-transform" style={{ y: beamY, opacity: beamOpacity, width: geo.w }}>
                <motion.div
                  className="absolute"
                  style={{
                    left: geo.left,
                    width: geo.right - geo.left,
                    top: 0,
                    scaleX: beamScale,
                    transformOrigin: `${(geo.sx ?? geo.left) - geo.left}px 0`,
                  }}
                >
                  <div
                    className="absolute inset-x-0 -top-14 h-14"
                    style={{ background: `linear-gradient(to top, rgba(255,90,31,${wide ? 0.07 : 0.05}), rgba(255,90,31,0))` }}
                  />
                  {wide && <div className="absolute inset-x-0 -top-[5px] h-[10px]" style={{ background: "linear-gradient(to bottom, rgba(255,90,31,0), rgba(255,90,31,0.22), rgba(255,90,31,0))" }} />}
                  <div className="absolute inset-x-0 -top-[0.75px] h-[1.5px]" style={{ background: ORANGE, opacity: wide ? 1 : 0.75 }} />
                </motion.div>
                {/* Bright end caps */}
                {[capL, capR].map((x, i) => (
                  <motion.span key={i} className="absolute top-0 -ml-[3px] -mt-[3px] w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,90,31,0.6)]" style={{ x }} />
                ))}
              </motion.div>

              {/* Handover point → the waveform's start */}
              <motion.div className="absolute left-0 top-0" style={{ x: pointX, y: pointY, opacity: pointOpacity }}>
                <span className="absolute -left-4 -top-4 w-8 h-8 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(255,90,31,0.45), rgba(255,90,31,0))" }} />
                <span className="absolute -left-[3px] -top-[3px] w-1.5 h-1.5 rounded-full bg-brand-orange" />
              </motion.div>
              {ripple > 0 && geo.sx !== null && geo.sy !== null && (
                <span key={ripple} className="scan-ripple absolute w-4 h-4 -ml-2 -mt-2 rounded-full border border-brand-orange" style={{ left: geo.sx, top: geo.sy }} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const SCAN_CSS = `
@keyframes scan-ripple { from { transform: scale(1); opacity: 0.7; } to { transform: scale(3); opacity: 0; } }
.scan-ripple { animation: scan-ripple 700ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .scan-ripple { display: none; } }
`;
