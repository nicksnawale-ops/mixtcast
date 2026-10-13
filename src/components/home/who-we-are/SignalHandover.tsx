import React, { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

/**
 * "The signal hands over": a scroll-linked transition from the Hero into Who We Are.
 * All values are driven by scroll position (fully reversible, no scroll-jacking, transforms/opacity only).
 * Lenis drives the native window scroll, so `useScroll` stays in sync with it.
 */

/** Opacity of the Who We Are eyebrow dash — it takes over from the hand-over line. */
const HandoverContext = createContext<MotionValue<number> | null>(null);
export const useHandoverDashOpacity = () => useContext(HandoverContext);

// Scroll progress of the Who We Are wrapper: 0 when its top meets the bottom of the viewport, 1 when it reaches the top.
const DRAW = [0.15, 0.5]; // waveform draws across the screen
const COLLAPSE = [0.5, 0.85]; // …collapses toward the left into the eyebrow dash
const HANDOFF = [0.85, 0.9]; // line fades as the real dash appears
const RISE = [0, 0.6]; // the section rises in

const DASH_WIDTH = 16;
const LINE_HEIGHT = 24;

/** Wraps the Hero (content untouched): it gently recedes as it scrolls out. */
export const HeroRecede: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -24]);
  if (reduced) return <div ref={ref}>{children}</div>;
  return (
    <motion.div ref={ref} style={{ scale, opacity, y, transformOrigin: "50% 0%" }}>
      {children}
    </motion.div>
  );
};

/** Layout position of `el` inside `ancestor` (ignores transforms, so entrance animations can't skew it). */
const offsetWithin = (el: HTMLElement, ancestor: HTMLElement) => {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node !== ancestor) {
    // Ancestor isn't in the offsetParent chain: fall back to rects.
    const a = ancestor.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - a.left, y: r.top - a.top };
  }
  return { x, y };
};

// A full-width waveform whose amplitude swells in the middle.
const wavePath = (width: number) => {
  const points = 120;
  let d = "";
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const envelope = Math.pow(Math.sin(Math.PI * t), 2);
    const y = LINE_HEIGHT / 2 - Math.sin(t * 46 * Math.PI) * envelope * (LINE_HEIGHT / 2 - 2);
    d += `${i ? "L" : "M"}${(t * width).toFixed(1)} ${y.toFixed(2)} `;
  }
  return d.trim();
};

/** Wraps Who We Are: draws the hand-over line in the gap above it and lifts the section in. */
export const SignalHandover: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState({ width: 0, lineTop: -64, dashX: 0, dashY: 0 });

  useLayoutEffect(() => {
    const wrapper = ref.current;
    if (!wrapper || reduced) return;
    const measure = () => {
      // Gap above this section (Tailwind space-y puts it on the previous sibling); layout offsets ignore transforms.
      const prev = wrapper.previousElementSibling as HTMLElement | null;
      const gap = prev ? wrapper.offsetTop - (prev.offsetTop + prev.offsetHeight) : 96;
      const dash = wrapper.querySelector<HTMLElement>("[data-handover-dash]");
      const pos = dash ? offsetWithin(dash, wrapper) : { x: 0, y: 0 };
      setGeo({ width: wrapper.offsetWidth, lineTop: -gap / 2 - LINE_HEIGHT / 2, dashX: pos.x, dashY: pos.y + 1 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [reduced]);

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const pathLength = useTransform(p, DRAW, [0, 1]);
  const lineOpacity = useTransform(p, [DRAW[0], DRAW[0] + 0.05, HANDOFF[0], HANDOFF[1]], [0, 1, 1, 0]);
  const collapse = useTransform(p, COLLAPSE, [0, 1]);
  const scaleX = useTransform(collapse, (c) => 1 - c * (1 - DASH_WIDTH / Math.max(geo.width, 1)));
  const scaleY = useTransform(collapse, (c) => 1 - c * (1 - 2 / LINE_HEIGHT));
  const y = useTransform(collapse, (c) => c * (geo.dashY - (geo.lineTop + LINE_HEIGHT / 2)));
  const dashOpacity = useTransform(p, HANDOFF, [0, 1]);
  const riseY = useTransform(p, RISE, [40, 0]);
  const riseOpacity = useTransform(p, RISE, [0.35, 1]);

  if (reduced) return <div ref={ref}>{children}</div>;

  return (
    <div ref={ref} className="relative">
      {geo.width > 0 && (
        <motion.svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 overflow-visible"
          width={geo.width}
          height={LINE_HEIGHT}
          viewBox={`0 0 ${geo.width} ${LINE_HEIGHT}`}
          fill="none"
          style={{ top: geo.lineTop, opacity: lineOpacity, scaleX, scaleY, y, transformOrigin: `${geo.dashX}px 50%` }}
        >
          <motion.path
            d={wavePath(geo.width)}
            stroke="#FF5A1F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength }}
          />
        </motion.svg>
      )}
      <HandoverContext.Provider value={dashOpacity}>
        <motion.div style={{ y: riseY, opacity: riseOpacity }}>{children}</motion.div>
      </HandoverContext.Provider>
    </div>
  );
};
