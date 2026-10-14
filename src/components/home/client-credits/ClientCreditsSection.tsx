import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { CLIENT_PROJECTS } from "../../../data/clients";

/**
 * Home "Client Trust": "Closing Credits" — the clients set like film end credits: category on the left, client name
 * on the right, either side of a central hairline (mobile: one centred column). Only names and categories are shown;
 * the project descriptions/locations in the data are unconfirmed placeholders and are deliberately not rendered.
 * Rows are decorative on hover (no links exist), so they aren't focusable.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const LINE_MS = 900;
const ROW_AT = 0.25; // s, first row
const ROW_STAGGER = 0.11;
const ROW_S = 0.7;
const DOT_AFTER = 0.45; // s after its row starts
const SWEEP_AT = ROW_AT + (CLIENT_PROJECTS.length - 1) * ROW_STAGGER + ROW_S; // after the last row settles

const CSS = `
.cc-line { transform: scaleY(0); transform-origin: top; }
[data-credits="on"] .cc-line { animation: cc-line ${LINE_MS}ms cubic-bezier(0.45, 0, 0.2, 1) both; }
@keyframes cc-line { to { transform: scaleY(1); } }
.cc-cap { opacity: 0; }
[data-credits="on"] .cc-cap { animation: cc-fade 400ms ease-out both; }
[data-credits="on"] .cc-cap-bottom { animation-delay: ${LINE_MS - 150}ms; }
@keyframes cc-fade { to { opacity: 1; } }
.cc-sweep { opacity: 0; transform: translateX(-160%) skewX(-18deg); }
[data-credits="on"] .cc-sweep { animation: cc-sweep 1100ms cubic-bezier(0.45, 0, 0.25, 1) ${SWEEP_AT}s both; }
@keyframes cc-sweep { 0% { opacity: 0; transform: translateX(-160%) skewX(-18deg); } 15%, 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(560%) skewX(-18deg); } }

/* Decorative hover (desktop) */
.cc-name { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1), color 300ms ease; }
.cc-cat { transition: color 300ms ease; }
.cc-dot { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1); }
.cc-glow { opacity: 0; transition: opacity 300ms ease; }
@media (hover: hover) {
  .cc-row:hover .cc-name { transform: translateX(6px); color: var(--color-brand-navy); }
  .cc-row:hover .cc-cat { color: var(--color-ink); }
  .cc-row:hover .cc-dot { transform: scale(1.6); }
  .cc-row:hover .cc-glow { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .cc-line, .cc-cap, .cc-sweep { animation: none !important; }
  .cc-line { transform: none; }
  .cc-cap { opacity: 1; }
  .cc-sweep { display: none; }
  .cc-name, .cc-dot { transition: none !important; }
}
`;

/** Tiny 5-bar waveform glyph capping the hairline (mirrored at the bottom). */
const Cap: React.FC<{ bottom?: boolean }> = ({ bottom }) => (
  <svg
    aria-hidden="true"
    className={`cc-cap ${bottom ? "cc-cap-bottom -scale-y-100" : ""} absolute left-1/2 -translate-x-1/2 ${bottom ? "-bottom-5" : "-top-5"}`}
    width={22}
    height={14}
    viewBox="0 0 22 14"
  >
    {[4, 8, 14, 8, 4].map((h, i) => (
      <rect key={i} x={i * 4.6} y={14 - h} width={2.2} height={h} rx={1.1} fill={i === 2 ? "#FF5A1F" : "#0E3B8C"} opacity={i === 2 ? 0.9 : 0.55} />
    ))}
  </svg>
);

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

export const ClientCreditsSection: React.FC = () => {
  const reduced = !!useReducedMotion();
  const wide = useMedia("(min-width: 768px)");
  const listRef = useRef<HTMLDivElement>(null);
  const on = useInView(listRef, { once: true, amount: 0.25 }) || reduced;

  const rowMotion = (i: number) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 40, filter: wide ? "blur(4px)" : "blur(0px)" },
          animate: on ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
          transition: { duration: ROW_S, delay: ROW_AT + i * ROW_STAGGER, ease: EASE },
        };
  const dotMotion = (i: number) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { scale: 0, opacity: 0 },
          animate: on ? { scale: [0, 1.4, 1], opacity: 1 } : undefined,
          transition: { duration: 0.4, delay: ROW_AT + i * ROW_STAGGER + DOT_AFTER, times: [0, 0.6, 1], ease: EASE },
        };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <style>{CSS}</style>
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
          Client Trust
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading">
          Trusted by Prestigious Organizations
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Delivering mission-critical audio-visual installations across premier defense, institutional, and commercial leaders.
        </p>
      </div>

      <div ref={listRef} data-credits={on ? "on" : undefined} className="relative max-w-[880px] mx-auto mt-14 mb-6 overflow-hidden md:overflow-visible">
        {/* Central hairline with waveform caps (md+) */}
        {wide && (
          <div aria-hidden="true" className="absolute left-1/2 top-0 bottom-0 -ml-px w-px">
            <span className="cc-line absolute inset-0" style={{ background: "rgba(14,59,140,0.2)" }} />
            <Cap />
            <Cap bottom />
          </div>
        )}

        <ul className="relative flex flex-col gap-7 md:gap-8 py-2">
          {CLIENT_PROJECTS.map((client, i) => (
            <motion.li key={client.id} className="cc-row relative" {...rowMotion(i)}>
              {i > 0 && !wide && <span aria-hidden="true" className="block mx-auto mb-7 h-px w-8" style={{ background: "rgba(14,59,140,0.2)" }} />}
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 items-center text-center">
                <span className="cc-cat font-heading font-semibold text-[11px] uppercase tracking-[0.24em] text-ink-muted md:text-right">
                  {client.category}
                </span>
                <span
                  className="cc-name block mt-1 md:mt-0 md:text-left font-['Cormorant_Garamond',Georgia,serif] italic font-medium text-ink leading-tight"
                  style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)" }}
                >
                  {client.name}
                </span>
              </div>
              {/* Dot on the hairline, at the row's centre (md+) */}
              {wide && (
                <motion.span aria-hidden="true" className="absolute left-1/2 top-1/2 -ml-[2.5px] -mt-[2.5px] w-[5px] h-[5px]" {...dotMotion(i)}>
                  <span className="cc-glow absolute -inset-2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(255,90,31,0.45), rgba(255,90,31,0))" }} />
                  <span className="cc-dot absolute inset-0 rounded-full bg-brand-orange" />
                </motion.span>
              )}
            </motion.li>
          ))}
        </ul>

        {/* One faint diagonal light sweep after the credits settle */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className="cc-sweep absolute inset-y-0 left-0 w-1/6"
            style={{ background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))" }}
          />
        </div>
      </div>
    </section>
  );
};
