import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { Pictogram } from "./Pictograms";
import { BlueprintGrid, ProcessHeader, Reveal, SystemLivePill, pad2, type ProcessStep } from "./shared";
import { LIVE_AT, verticalPath } from "./signalMath";

const EASE = [0.22, 1, 0.36, 1] as const;
const LINE_W = 48; // the line's centre sits ~32–40px from the screen edge
const MID = LINE_W / 2;
const AMP = 17;
const NODE_OFFSET = 26; // node sits level with the stage's numeral

const StageBlock: React.FC<{ step: ProcessStep; reached: boolean; current: boolean; running: boolean; liRef: (el: HTMLLIElement | null) => void }> = ({
  step,
  reached,
  current,
  running,
  liRef,
}) => {
  const ref = useRef<HTMLLIElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (inView) setVisible(true);
  }, [inView]);
  return (
    <motion.li
      ref={(el) => {
        ref.current = el;
        liRef(el);
      }}
      className="relative"
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="flex items-center gap-4 mb-3">
        <span className="ps-num text-[48px] text-[rgba(14,59,140,0.08)] transition-opacity duration-500" style={{ opacity: reached ? 1 : 0.25 }}>
          {pad2(step.step)}
        </span>
        <Pictogram stage={step.step} play={visible} loop={current && running} reduced={false} size={64} />
      </div>
      <h3 className="font-heading font-semibold text-xl text-ink">{step.title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted max-w-xl">{step.description}</p>
    </motion.li>
  );
};

/** Tablet & mobile (< lg): the signal runs vertically down the left; it draws as the section scrolls by. */
export const VerticalSignalJourney: React.FC<{ steps: ProcessStep[]; running: boolean }> = ({ steps, running }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const liRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [geo, setGeo] = useState({ h: 0, nodes: [] as number[] });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () =>
      setGeo({ h: list.offsetHeight, nodes: liRefs.current.map((li) => (li ? li.offsetTop + NODE_OFFSET : 0)) });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // Draws from when the list's top is 75% down the viewport until its end is 55% down.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const drawn = useSpring(scrollYProgress, { stiffness: 140, damping: 32, restDelta: 0.0005 });

  const [state, setState] = useState({ reached: 0, live: false });
  const sync = (d: number) => {
    const y = d * geo.h;
    const next = { reached: geo.nodes.filter((n) => y >= n).length, live: d >= LIVE_AT };
    setState((prev) => (prev.reached === next.reached && prev.live === next.live ? prev : next));
  };
  useMotionValueEvent(drawn, "change", sync);
  useEffect(() => sync(drawn.get()), [geo]); // eslint-disable-line react-hooks/exhaustive-deps

  const path = useMemo(() => (geo.h ? verticalPath(geo.h, MID, AMP) : ""), [geo.h]);

  return (
    <div className="relative py-20 overflow-hidden">
      <BlueprintGrid />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        <ProcessHeader className="mb-12" />

        <div ref={listRef} className="relative">
          {geo.h > 0 && (
            <>
              <svg aria-hidden="true" className="absolute left-0 top-0 overflow-visible" width={LINE_W} height={geo.h} viewBox={`0 0 ${LINE_W} ${geo.h}`} fill="none">
                <path d={path} stroke="#9AA3AF" strokeOpacity={0.45} strokeWidth={1} strokeDasharray="3 6" />
              </svg>
              {/* The drawn signal, revealed top → bottom; breathes gently once live */}
              <div aria-hidden="true" className={`absolute left-0 top-0 ${state.live && running ? "ps-breathe" : ""}`} style={{ width: LINE_W, height: geo.h }}>
                <Reveal progress={drawn} axis="y" className="absolute inset-0">
                  <svg width={LINE_W} height={geo.h} viewBox={`0 0 ${LINE_W} ${geo.h}`} fill="none">
                    <defs>
                      <linearGradient id="ps-signal-v" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={geo.h}>
                        <stop offset="0" stopColor="#0E3B8C" />
                        <stop offset="0.55" stopColor="#3A2D8F" />
                        <stop offset="1" stopColor="#FF5A1F" />
                      </linearGradient>
                    </defs>
                    <path d={path} stroke="url(#ps-signal-v)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Reveal>
              </div>
            </>
          )}

          {/* Nodes on the line */}
          {geo.nodes.map((y, k) => {
            const reached = state.reached > k;
            return (
              <span key={k} aria-hidden="true" className="absolute w-3.5 h-3.5" style={{ left: MID - 7, top: y - 7 }}>
                <span className={`absolute inset-0 rounded-full border-2 bg-white transition-colors duration-300 ${reached ? "border-brand-navy" : "border-[#C9CED6]"}`} />
                <motion.span
                  className="absolute inset-[3px] rounded-full bg-brand-orange"
                  initial={false}
                  animate={{ scale: reached ? 1 : 0, opacity: reached ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                />
                <AnimatePresence>
                  {reached && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-brand-orange"
                      initial={{ scale: 1, opacity: 0.7 }}
                      animate={{ scale: 3, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>
              </span>
            );
          })}

          <ol className="space-y-14 pl-16 sm:pl-20">
            {steps.map((s, k) => (
              <StageBlock
                key={s.step}
                step={s}
                reached={state.reached > k}
                // Only the stage the signal has most recently reached runs its idle loop.
                current={state.reached === k + 1}
                running={running}
                liRef={(el) => {
                  liRefs.current[k] = el;
                }}
              />
            ))}
          </ol>
        </div>

        <div className="mt-10 pl-16 sm:pl-20 h-8">
          <AnimatePresence>
            {state.live && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.4, ease: EASE }}>
                <SystemLivePill />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
