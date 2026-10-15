import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { Pictogram } from "./Pictograms";
import { BlueprintGrid, ProcessHeader, Reveal, SystemLivePill, pad2, type ProcessStep } from "./shared";
import { DRAW_END, DRAW_START, HEADER_HEIGHT, LIVE_AT, NODES, PIN_HEIGHT_VH, horizontalPath, progressAtNode, stageFor, wave } from "./signalMath";

const EASE = [0.22, 1, 0.36, 1] as const;
const NUM_H = 84; // numerals row above the line
const LINE_H = 128;
const MID = LINE_H / 2;
const AMP = 54;

/**
 * Desktop (lg+): a tall wrapper with a sticky stage (native `position: sticky`, no scroll-jacking).
 * Scroll progress through the wrapper (Lenis drives the native scroll, so `useScroll` follows it) draws the
 * signal line; the stage it has reached is shown in the detail panel.
 */
export const PinnedSignalStory: React.FC<{ steps: ProcessStep[]; running: boolean }> = ({ steps, running }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const measure = () => setWidth(el.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 0 when the wrapper's top meets the header, 1 when its end meets the viewport bottom (the stage unpins).
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: [`start ${HEADER_HEIGHT}px`, "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 32, restDelta: 0.0005 });
  const drawn = useTransform(progress, [DRAW_START, DRAW_END], [0, 1], { clamp: true });

  const headX = useTransform(drawn, (d) => d * width);
  const headY = useTransform(drawn, (d) => NUM_H + MID - wave(d) * AMP);
  const headOpacity = useTransform(drawn, [0, 0.015, 0.97, 1], [0, 1, 1, 0]);
  const lightX = useTransform(drawn, (d) => d * width);

  const [state, setState] = useState(() => ({ stage: 1, reached: 0, live: false }));
  const sync = (d: number) => {
    const next = { stage: stageFor(d), reached: NODES.filter((n) => d >= n).length, live: d >= LIVE_AT };
    setState((prev) => (prev.stage === next.stage && prev.reached === next.reached && prev.live === next.live ? prev : next));
  };
  useMotionValueEvent(drawn, "change", sync);
  useEffect(() => sync(drawn.get()), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw the active stage's pictogram each time it becomes active.
  const [plays, setPlays] = useState<number[]>(() => steps.map((_, i) => (i === 0 ? 1 : 0)));
  useEffect(() => {
    setPlays((p) => p.map((v, i) => (i === state.stage - 1 ? v + 1 : v)));
  }, [state.stage]);

  const path = useMemo(() => (width ? horizontalPath(width, MID, AMP) : ""), [width]);

  /** Scroll to the moment the signal has just reached node `k` (0-based). */
  const goTo = (k: number) => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;
    const top = wrap.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
    const range = wrap.offsetHeight - stage.offsetHeight;
    window.scrollTo({ top: top + (progressAtNode(k) + 0.02) * range, behavior: "smooth" });
  };
  const onNodeKey = (e: React.KeyboardEvent, k: number) => {
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? k + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? k - 1 : -1;
    if (next < 0 || next >= steps.length) return;
    e.preventDefault();
    nodeRefs.current[next]?.focus();
    goTo(next);
  };

  return (
    <div ref={wrapRef} className="relative" style={{ height: `${PIN_HEIGHT_VH}vh` }}>
      <div
        ref={stageRef}
        className="sticky overflow-hidden"
        style={{ top: HEADER_HEIGHT, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        <BlueprintGrid />
        <div className="relative h-full max-w-7xl mx-auto px-8 flex flex-col justify-center gap-[clamp(1.25rem,4vh,3rem)]">
          <ProcessHeader className="mb-0" />

          {/* Signal line */}
          <div ref={lineRef} className="relative" style={{ height: NUM_H + LINE_H }}>
            {/* Soft light following the signal head */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-1/2 -ml-[220px] -mt-[160px] w-[440px] h-[320px] rounded-full"
              style={{ x: lightX, opacity: headOpacity, background: "radial-gradient(closest-side, rgba(255,90,31,0.10), rgba(14,59,140,0.04) 55%, rgba(14,59,140,0))" }}
            />
            {width > 0 && (
              <>
                {/* Undrawn remainder: a faint dashed guide */}
                <svg aria-hidden="true" className="absolute left-0 overflow-visible" style={{ top: NUM_H }} width={width} height={LINE_H} viewBox={`0 0 ${width} ${LINE_H}`} fill="none">
                  <path d={path} stroke="#9AA3AF" strokeOpacity={0.45} strokeWidth={1} strokeDasharray="3 6" />
                </svg>
                {/* The drawn signal (navy → orange), revealed left → right; breathes gently once live */}
                <div aria-hidden="true" className={`absolute left-0 ${state.live && running ? "ps-breathe" : ""}`} style={{ top: NUM_H, width, height: LINE_H }}>
                  <Reveal progress={drawn} axis="x" className="absolute inset-0">
                    <svg width={width} height={LINE_H} viewBox={`0 0 ${width} ${LINE_H}`} fill="none">
                      <defs>
                        <linearGradient id="ps-signal" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={width} y2="0">
                          <stop offset="0" stopColor="#0E3B8C" />
                          <stop offset="0.55" stopColor="#3A2D8F" />
                          <stop offset="1" stopColor="#FF5A1F" />
                        </linearGradient>
                      </defs>
                      <path d={path} stroke="url(#ps-signal)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Reveal>
                </div>
              </>
            )}

            {/* Signal head */}
            <motion.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0" style={{ x: headX, y: headY, opacity: headOpacity }}>
              <span className="absolute -left-5 -top-5 w-10 h-10 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(255,90,31,0.45), rgba(255,90,31,0))" }} />
              <span className="absolute -left-[5px] -top-[5px] w-2.5 h-2.5 rounded-full bg-brand-orange shadow-[0_0_0_3px_rgba(255,255,255,0.9)]" />
            </motion.div>

            {/* Stage nodes (buttons) with outlined numerals */}
            {steps.map((s, k) => {
              const reached = state.reached > k;
              const active = state.stage === s.step;
              return (
                <button
                  key={s.step}
                  ref={(el) => {
                    nodeRefs.current[k] = el;
                  }}
                  type="button"
                  aria-label={`Stage ${s.step}: ${s.title}`}
                  aria-current={active ? "step" : undefined}
                  onClick={() => goTo(k)}
                  onKeyDown={(e) => onNodeKey(e, k)}
                  className="group absolute top-0 -translate-x-1/2 flex flex-col items-center rounded-2xl outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange cursor-pointer"
                  style={{ left: `${NODES[k] * 100}%`, height: NUM_H + MID + 14, paddingInline: 12 }}
                >
                  <motion.span
                    aria-hidden="true"
                    className="ps-num block text-[72px] text-[rgba(14,59,140,0.08)]"
                    animate={{ opacity: active ? 1 : 0.12, y: active ? 0 : 4 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    {pad2(s.step)}
                  </motion.span>
                  <span className="absolute left-1/2 -ml-[7px] w-3.5 h-3.5" style={{ top: NUM_H + MID - 7 }}>
                    <span className={`absolute inset-0 rounded-full border-2 bg-white transition-colors duration-300 ${reached ? "border-brand-navy" : "border-[#C9CED6]"} group-hover:border-brand-orange`} />
                    <motion.span
                      className="absolute inset-[3px] rounded-full bg-brand-orange"
                      initial={false}
                      animate={{ scale: reached ? 1 : 0, opacity: reached ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                    <AnimatePresence>
                      {reached && (
                        <motion.span
                          key="ripple"
                          className="absolute inset-0 rounded-full border border-brand-orange"
                          initial={{ scale: 1, opacity: 0.7 }}
                          animate={{ scale: 3, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      )}
                    </AnimatePresence>
                  </span>
                </button>
              );
            })}

            {/* End state */}
            <AnimatePresence>
              {state.live && (
                <motion.div
                  className="absolute right-0"
                  style={{ top: NUM_H + LINE_H - 6 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <SystemLivePill />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stage detail: every stage stays in the DOM (in order); only the active one is shown */}
          <ol className="grid max-w-3xl w-full mx-auto">
            {steps.map((s, k) => {
              const active = state.stage === s.step;
              return (
                <motion.li
                  key={s.step}
                  className={`[grid-area:1/1] flex items-start gap-7 ${active ? "" : "pointer-events-none"}`}
                  initial={false}
                  animate={{ opacity: active ? 1 : 0, y: active ? 0 : s.step < state.stage ? -12 : 12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <Pictogram key={plays[k]} stage={s.step} play={active} loop={active && running} reduced={false} />
                  <div className="pt-1">
                    <span className="block text-xs font-bold tracking-[0.2em] text-brand-orange mb-1.5">{pad2(s.step)}</span>
                    <h3 className="font-heading font-semibold text-[28px] leading-tight text-ink">{s.title}</h3>
                    <p className="mt-2 text-[17px] leading-relaxed text-ink-muted max-w-[36rem]">{s.description}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
};
