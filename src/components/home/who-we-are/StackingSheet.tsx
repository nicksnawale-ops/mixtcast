import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { EASE_OUT } from "./whoWeAreData";

/**
 * "Stacking sheet": Who We Are rises like a sheet over the pinned Hero, which gently recedes behind it.
 * Everything is driven by the scroll position (fully reversible, no scroll-jacking, transforms/opacity only).
 * Lenis drives the native window scroll, so `useScroll` stays in sync with it.
 *
 *   <HeroSheetStack>
 *     <StackedHero>…hero…</StackedHero>
 *     <RisingSheet>…section…</RisingSheet>
 *   </HeroSheetStack>
 */

const HEADER_HEIGHT = 80; // the fixed header: the sheet "docks" when its top edge reaches the header's bottom
const RECEDE = { scale: 0.94, opacity: 0.35, y: "-2%" };
const SPRING = { stiffness: 120, damping: 30 };

interface StackState {
  /** md+ and motion allowed: the Hero is pinned and recedes. */
  pinned: boolean;
  /** Mobile, motion allowed: the sheet rises and fades in instead. */
  rising: boolean;
  /** 0 at the top of the page → 1 when the sheet docks under the header. */
  progress: MotionValue<number>;
  sheetRef: React.RefObject<HTMLDivElement | null>;
}

const StackContext = createContext<StackState | null>(null);
const useStack = () => {
  const ctx = useContext(StackContext);
  if (!ctx) throw new Error("StackedHero / RisingSheet must be used inside HeroSheetStack");
  return ctx;
};

/** Holds the pinned Hero and the sheet; the Hero stays pinned only while this wrapper scrolls by. */
export const HeroSheetStack: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduced = !!useReducedMotion();
  const [isMd, setIsMd] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsMd(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Scroll distance from the top of the page to the moment the sheet docks (layout position: ignores transforms).
  const sheetRef = useRef<HTMLDivElement>(null);
  const dockAt = useRef(1);
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const measure = () => {
      let top = 0;
      for (let node: HTMLElement | null = sheet; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
      dockAt.current = Math.max(1, top - HEADER_HEIGHT);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (y) => Math.min(1, Math.max(0, y / dockAt.current)));

  return (
    <StackContext.Provider value={{ pinned: isMd && !reduced, rising: !isMd && !reduced, progress, sheetRef }}>
      <div className="relative">{children}</div>
    </StackContext.Provider>
  );
};

/** Wraps the Hero (content untouched): pinned on md+, receding as the sheet rises over it. */
export const StackedHero: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pinned, progress } = useStack();
  const smooth = useSpring(progress, SPRING);
  const scale = useTransform(smooth, [0, 1], [1, RECEDE.scale]);
  const opacity = useTransform(smooth, [0, 1], [1, RECEDE.opacity]);
  const y = useTransform(smooth, [0, 1], ["0%", RECEDE.y]);
  // Fully covered once docked: stop painting it.
  const visibility = useTransform(progress, (p) => (p >= 1 ? "hidden" : "visible"));
  if (!pinned) return <div className="relative z-0">{children}</div>;
  return (
    <div className="sticky top-0 z-0">
      <motion.div style={{ scale, opacity, y, visibility, transformOrigin: "50% 0%" }}>{children}</motion.div>
    </div>
  );
};

// Grip: seven bars (navy / orange) that rise and settle once as the sheet arrives.
const GRIP_BARS = [0.4, 0.65, 0.85, 1, 0.85, 0.65, 0.4];

const SheetGrip: React.FC<{ reduced: boolean }> = ({ reduced }) => {
  const ref = useRef<HTMLDivElement>(null);
  // "Docked": the grip has reached the top ~30% of the viewport, just below the header.
  const arrived = useInView(ref, { once: true, margin: `-${HEADER_HEIGHT}px 0px -70% 0px` });
  return (
    <div ref={ref} aria-hidden="true" className="absolute left-1/2 top-3 -translate-x-1/2 flex items-center justify-between w-14 h-3.5">
      {GRIP_BARS.map((h, i) => (
        <motion.span
          key={i}
          className={`block w-[3px] rounded-full ${i % 2 ? "bg-brand-orange" : "bg-brand-navy"}`}
          style={{ height: `${h * 100}%` }}
          initial={reduced ? false : { scaleY: 0.3 }}
          animate={reduced || !arrived ? undefined : { scaleY: [0.3, 1.35, 0.85, 1] }}
          transition={{ duration: 0.7, delay: Math.abs(i - 3) * 0.06, times: [0, 0.45, 0.75, 1], ease: EASE_OUT }}
        />
      ))}
    </div>
  );
};

/** The sheet: white, rounded top corners, soft upward shadow, hairline and grip. */
export const RisingSheet: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { rising, sheetRef } = useStack();
  const reduced = !!useReducedMotion();
  // Mobile: the sheet rises and fades in as it scrolls into view.
  const { scrollYProgress } = useScroll({ target: sheetRef, offset: ["start end", "start 0.4"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  return (
    <motion.div
      ref={sheetRef}
      className="relative z-10 bg-white border-t border-[#E6E8EC] rounded-t-[24px] md:rounded-t-[28px] lg:rounded-t-[40px] shadow-[0_-24px_60px_rgba(14,59,140,0.08)] pt-16 sm:pt-20 lg:pt-24"
      style={rising ? { y, opacity } : undefined}
    >
      <SheetGrip reduced={reduced} />
      {children}
    </motion.div>
  );
};
