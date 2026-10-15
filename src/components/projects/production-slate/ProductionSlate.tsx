import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useInView } from "motion/react";
import type { ClientProject } from "../../../data/clients";
import type { Testimonial } from "../../../data/testimonials";

/**
 * Projects page — "The Production Slate": each project as a film clapperboard. A striped clapstick (hinged at the
 * left) claps shut on reveal, then the slate's fields (TAKE · SECTOR · CLIENT · SCOPE) write in. Only confirmed
 * content is shown: name, category, confirmed scope, and a linked client testimonial. Tuning: SLATE below.
 */

export const SLATE = {
  stagger: 0.12, // s between slates entering together
  rise: 30, // px
  openDeg: -28, // clapstick open angle before the clap
  clapAt: 0.45, // s after the slate starts rising
  clapMs: 280,
  fieldStagger: 0.06,
  hoverOpenDeg: -14,
  excerpt: 110, // characters of the testimonial shown on the slate
};

export const SLATE_CSS = `
.slate-stick-hover { transform-origin: 14px 100%; }
@media (hover: hover) {
  .slate:hover .slate-stick-hover, .slate:focus-visible .slate-stick-hover { animation: slate-peek 700ms cubic-bezier(0.22, 1, 0.36, 1); }
  .slate:hover .slate-stripes, .slate:focus-visible .slate-stripes { transform: translateX(-6px); }
  .slate:hover .slate-lift, .slate:focus-visible .slate-lift { transform: translateY(-6px); box-shadow: 0 22px 44px -22px rgba(10,42,99,0.35); }
}
@keyframes slate-peek { 0% { transform: rotate(0deg); } 40% { transform: rotate(${SLATE.hoverOpenDeg}deg); } 100% { transform: rotate(0deg); } }
.slate-stripes { transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1); }
.slate-lift { transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 350ms ease; }
.slate-num { font-family: var(--font-heading); font-weight: 700; color: transparent; -webkit-text-stroke: 1.25px rgba(14,59,140,0.55); letter-spacing: -0.01em; }
.slate-label { font-family: var(--font-heading); font-weight: 600; font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #8A929E; }
@media (prefers-reduced-motion: reduce) {
  .slate-stick-hover, .slate-stripes { animation: none !important; transition: none !important; transform: none !important; }
  .slate-lift { transition: none; }
}
`;

const EASE = [0.22, 1, 0.36, 1] as const;

/** The striped clapstick: navy/white diagonal stripes with one orange stripe; a small pivot at the left. */
export const Clapstick: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div aria-hidden="true" className={`relative h-11 rounded-t-[14px] overflow-hidden border border-b-0 border-[#0A2A63] bg-white ${className}`}>
    <div
      className="slate-stripes absolute inset-y-0 -left-4 -right-4"
      style={{ background: "repeating-linear-gradient(135deg, #0E3B8C 0 18px, #FFFFFF 18px 36px)" }}
    />
    {/* One orange stripe */}
    <div className="absolute inset-y-0 left-[58%] w-[18px] bg-brand-orange" style={{ transform: "skewX(-45deg)" }} />
    {/* Pivot */}
    <span className="absolute left-2 bottom-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#0A2A63]" />
  </div>
);

export const takeNumber = (n: number) => String(n).padStart(2, "0");

const excerptOf = (quote: string) => {
  if (quote.length <= SLATE.excerpt) return quote;
  const cut = quote.slice(0, SLATE.excerpt);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

interface SlateProps {
  project: ClientProject;
  take: number;
  testimonial?: Testimonial;
  reduced: boolean;
  claimDelay: () => number;
  onOpen: () => void;
}

export const ProductionSlate: React.FC<SlateProps> = ({ project, take, testimonial, reduced, claimDelay, onOpen }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const [delay, setDelay] = useState<number | null>(reduced ? 0 : null);
  useEffect(() => {
    if (inView && delay === null) setDelay(claimDelay());
  }, [inView, delay, claimDelay]);
  const on = delay !== null;
  const clap = (delay ?? 0) + SLATE.clapAt;
  const shake = useAnimationControls();
  useEffect(() => {
    if (!on || reduced) return;
    const t = window.setTimeout(() => {
      shake.start({ x: [0, 2, -2, 1, 0], transition: { duration: 0.2 } });
    }, (clap + SLATE.clapMs / 1000) * 1000);
    return () => window.clearTimeout(t);
  }, [on, reduced, clap, shake]);

  const field = (i: number) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 8 },
          animate: on ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.4, delay: clap + SLATE.clapMs / 1000 + 0.1 + i * SLATE.fieldStagger, ease: EASE },
        };

  return (
    // A div with button semantics (a real <button> may only contain inline content; this slate needs block layout).
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`${project.name} — view project details`}
      className="slate group block w-full h-full text-left rounded-[18px] outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange cursor-pointer"
      initial={reduced ? false : { opacity: 0, y: SLATE.rise }}
      animate={on ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay: delay ?? 0, ease: EASE }}
    >
      <motion.div className="h-full" animate={shake}>
        <div className="slate-lift h-full flex flex-col rounded-[18px]">
          {/* Clapstick: open on arrival, claps shut with a small bounce; a flash line on the clap */}
          <div className="relative">
            <motion.div
              className="origin-[14px_100%]"
              initial={reduced ? false : { rotate: SLATE.openDeg }}
              animate={on ? { rotate: [SLATE.openDeg, 2, 0] } : undefined}
              transition={{ duration: SLATE.clapMs / 1000, delay: clap, times: [0, 0.8, 1], ease: ["easeIn", "easeOut"] }}
            >
              <div className="slate-stick-hover">
                <Clapstick />
              </div>
            </motion.div>
            {!reduced && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-3 top-1/2 h-[2px] -mt-px rounded-full bg-white"
                initial={{ opacity: 0, scaleX: 0.3 }}
                animate={on ? { opacity: [0, 0.95, 0], scaleX: [0.3, 1, 1] } : undefined}
                transition={{ duration: 0.35, delay: clap + SLATE.clapMs / 1000 - 0.05 }}
              />
            )}
          </div>

          {/* Slate body */}
          <div className="flex-1 flex flex-col bg-white border border-[#E6E8EC] rounded-b-[18px] shadow-[0_10px_30px_-18px_rgba(10,42,99,0.3)]">
            <motion.div className="grid grid-cols-[auto_1fr] border-b border-[#E6E8EC]" {...field(0)}>
              <div className="px-5 py-3 border-r border-[#E6E8EC]">
                <span className="slate-label block">Take</span>
                <span className="slate-num block text-[36px] leading-none mt-1">{takeNumber(take)}</span>
              </div>
              <div className="px-5 py-3 min-w-0">
                <span className="slate-label block">Sector</span>
                <span className="block mt-1.5 font-heading font-semibold text-sm text-brand-navy">{project.category}</span>
              </div>
            </motion.div>

            <motion.div className="px-5 py-4 border-b border-[#E6E8EC]" {...field(1)}>
              <span className="slate-label block">Client</span>
              <span className="block mt-1.5 font-heading font-semibold text-[22px] leading-snug text-ink">{project.name}</span>
            </motion.div>

            {project.scope && (
              <motion.div className="px-5 py-4 border-b border-[#E6E8EC]" {...field(2)}>
                <span className="slate-label block">Scope</span>
                <span className="block mt-1.5 text-[15px] leading-relaxed text-[#4A5260]">{project.scope}</span>
              </motion.div>
            )}

            <motion.div className="flex-1 flex flex-col justify-between gap-4 px-5 py-4" {...field(3)}>
              {testimonial ? (
                <p className="text-sm italic leading-relaxed text-ink-muted">
                  <span aria-hidden="true" className="mr-1 font-heading not-italic font-bold text-brand-orange">“</span>
                  {excerptOf(testimonial.quote)}{" "}
                  {/* Not a separate control: the whole slate opens the details */}
                  <span className="not-italic font-semibold text-brand-navy underline underline-offset-2 decoration-brand-orange/50 group-hover:text-brand-orange">
                    Read testimonial
                  </span>
                </p>
              ) : (
                <span />
              )}
              {project.confirmed && (
                <span className="self-end inline-flex items-center gap-1.5 rounded-full border border-[#E6E8EC] bg-surface-warm px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                  Delivered
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
