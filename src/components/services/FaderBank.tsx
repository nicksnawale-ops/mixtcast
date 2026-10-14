import React, { useEffect, useRef, useState } from "react";
import { SVC } from "./servicesConsoleStyles";

/**
 * A faint bank of console faders behind the Services hero, moving like an automated mix: every knob glides to a new
 * height every 3–5s (CSS transform transition). Masked to be softest behind the heading; paused off-screen / hidden.
 */

const TRACK_H = 220;
const KNOB_W = 22;
const KNOB_H = 8;

export const FaderBank: React.FC<{ count: number; reduced: boolean }> = ({ count, reduced }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: count }, (_, i) => 0.3 + 0.4 * Math.abs(Math.sin(i * 1.7))));
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLevels(Array.from({ length: count }, (_, i) => 0.3 + 0.4 * Math.abs(Math.sin(i * 1.7))));
  }, [count]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let onScreen = false;
    const update = () => setRunning(onScreen && !document.hidden);
    const observer = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Each knob gets its own 3–5s schedule.
  useEffect(() => {
    if (reduced || !running) return;
    const [lo, hi] = SVC.faders.moveEveryMs;
    const timers: number[] = [];
    const schedule = (i: number) => {
      timers[i] = window.setTimeout(() => {
        setLevels((l) => l.map((v, k) => (k === i ? 0.12 + Math.random() * 0.76 : v)));
        schedule(i);
      }, lo + Math.random() * (hi - lo));
    };
    for (let i = 0; i < count; i++) schedule(i);
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced, running, count]);

  const navy = `rgba(14,59,140,${SVC.faders.opacity})`;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-[4%]"
      style={{
        height: TRACK_H,
        maskImage: "radial-gradient(ellipse 38% 70% at 50% 50%, rgba(0,0,0,0.15), #000 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 38% 70% at 50% 50%, rgba(0,0,0,0.15), #000 75%)",
      }}
    >
      {levels.map((level, i) => (
        <div key={i} className="relative h-full" style={{ width: KNOB_W }}>
          <span className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: navy }} />
          <span
            className="svc-knob absolute left-0 top-0 rounded-[2px] border bg-white"
            style={{ width: KNOB_W, height: KNOB_H, borderColor: navy, transform: `translateY(${(1 - level) * (TRACK_H - KNOB_H)}px)` }}
          />
        </div>
      ))}
    </div>
  );
};
