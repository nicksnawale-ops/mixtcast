import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";

/**
 * Console faders driven by a 0–1 motion value. Transform only: the knob moves with translate, and the
 * navy → orange fill below/left of it is revealed by two counter-moving transforms in a clip (no repaint).
 */

const TRACK = "#E6E8EC";
export const TRACK_H = 180;
const KNOB_LONG = 28;
const KNOB_SHORT = 12;

const TICKS_V = Array.from({ length: 11 }, (_, i) => i);

/** Fader cap: white, 1px navy border, soft shadow, thin orange centre line. */
const Cap: React.FC<{ vertical: boolean }> = ({ vertical }) => (
  <span
    className="absolute inset-0 rounded-[3px] bg-white border border-brand-navy shadow-[0_2px_6px_rgba(10,42,99,0.18)]"
    aria-hidden="true"
  >
    <span className={`absolute bg-brand-orange ${vertical ? "left-1 right-1 top-1/2 h-px -mt-px" : "top-1 bottom-1 left-1/2 w-px -ml-px"}`} />
  </span>
);

export const VerticalFader: React.FC<{ pos: MotionValue<number>; bright: boolean }> = ({ pos, bright }) => {
  const knobY = useTransform(pos, (v) => (1 - v) * (TRACK_H - KNOB_SHORT));
  const hidden = useTransform(pos, (v) => (1 - v) * TRACK_H);
  const back = useTransform(hidden, (v) => -v);
  return (
    <div aria-hidden="true" className="relative" style={{ width: KNOB_LONG + 14, height: TRACK_H }}>
      {/* Fine ticks on the left of the track; every 5th is longer */}
      <svg className="absolute left-0 top-0" width={10} height={TRACK_H} viewBox={`0 0 10 ${TRACK_H}`} fill="none">
        {TICKS_V.map((i) => {
          const y = 6 + (i * (TRACK_H - 12)) / (TICKS_V.length - 1);
          return <path key={i} d={`M${i % 5 === 0 ? 0 : 4} ${y} H8`} stroke="rgba(14,59,140,0.28)" strokeWidth={1} />;
        })}
      </svg>
      <div className="absolute top-0 bottom-0 w-[2px] rounded-full" style={{ left: 14 + KNOB_LONG / 2 - 1, background: TRACK }} />
      <motion.div className="absolute top-0 w-[2px] overflow-hidden will-change-transform" style={{ left: 14 + KNOB_LONG / 2 - 1, height: TRACK_H, y: hidden }}>
        <motion.div
          className="w-full rounded-full transition-opacity duration-300"
          style={{ height: TRACK_H, y: back, opacity: bright ? 1 : 0.8, background: "linear-gradient(to top, #0E3B8C, #FF5A1F)" }}
        />
      </motion.div>
      <motion.div className="absolute top-0 will-change-transform" style={{ left: 14, width: KNOB_LONG, height: KNOB_SHORT, y: knobY }}>
        <Cap vertical />
      </motion.div>
    </div>
  );
};

/** Horizontal fader across the full width of its container (mobile/tablet rows). */
export const HorizontalFader: React.FC<{ pos: MotionValue<number>; bright: boolean }> = ({ pos, bright }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const width = useMotionValue(0); // so the transforms update on resize too, not only when the knob moves
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      setW(el.offsetWidth);
      width.set(el.offsetWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);
  const knobX = useTransform(() => pos.get() * Math.max(0, width.get() - KNOB_SHORT));
  const hidden = useTransform(() => -(1 - pos.get()) * width.get());
  const back = useTransform(hidden, (v) => -v);
  return (
    <div ref={ref} aria-hidden="true" className="relative w-full" style={{ height: KNOB_LONG }}>
      <div className="absolute left-0 right-0 h-[2px] rounded-full" style={{ top: KNOB_LONG / 2 - 1, background: TRACK }} />
      <motion.div className="absolute left-0 h-[2px] overflow-hidden will-change-transform" style={{ top: KNOB_LONG / 2 - 1, width: w, x: hidden }}>
        <motion.div
          className="h-full rounded-full transition-opacity duration-300"
          style={{ width: w, x: back, opacity: bright ? 1 : 0.8, background: "linear-gradient(to right, #0E3B8C, #FF5A1F)" }}
        />
      </motion.div>
      <motion.div className="absolute top-0 left-0 will-change-transform" style={{ width: KNOB_SHORT, height: KNOB_LONG, x: knobX }}>
        <Cap vertical={false} />
      </motion.div>
    </div>
  );
};
