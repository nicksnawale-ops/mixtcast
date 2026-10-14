import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COMPANY_INFO } from "../../../data/company";
import { LogoMark } from "../../brand/Logo";
import { PREMIERE_CSS, T } from "./premiereStyles";

/**
 * Home philosophy quote: "The Premiere" — the quote as a cinematic title card. Cinema masking opens, a projector beam
 * fades in (with drifting dust), the words come into focus, a light sweep passes, "brought to life." is underlined,
 * and the MIXTCAST play mark comes to life. Plays once per page view (~2.75s); timings in premiereStyles.ts.
 */

const ATTRIBUTION = "MIXTCAST VISUAL SOLUTIONS PVT. LTD.";
const QUOTE = COMPANY_INFO.philosophy; // "Your vision, our technology — brought to life."
const FINALE = "brought to life.";
const EASE = [0.22, 1, 0.36, 1] as const;

// Dust: deterministic positions (% of the beam), sizes and drifts; the first 6 are kept on mobile.
const DUST = [
  [48, 18, 1.5, 0], [56, 30, 1, 1], [42, 44, 2, 0], [60, 52, 1.5, 1], [36, 62, 1, 0], [52, 70, 2, 1],
  [66, 38, 1, 0], [30, 80, 1.5, 1], [70, 74, 2, 0], [45, 88, 1, 1], [58, 92, 1.5, 0],
].map(([x, y, size, orange], i) => ({ x, y, size, orange: !!orange, dur: 6 + (i % 5) * 1.3, delay: -i * 0.9, dx: (i % 2 ? 8 : -8), dy: -10 - (i % 3) * 5 }));

/** Colour the tokens without changing the wording: "vision" navy, "technology" orange. */
const Token: React.FC<{ word: string }> = ({ word }) => {
  const m = word.match(/^(vision|technology)(.*)$/i);
  if (!m) return <>{word}</>;
  return (
    <>
      <span className={m[1].toLowerCase() === "vision" ? "text-brand-navy" : "text-brand-orange"}>{m[1]}</span>
      {m[2]}
    </>
  );
};

export const PremiereQuoteSection: React.FC = () => {
  const reduced = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const on = useInView(blockRef, { once: true, amount: 0.3 }) || reduced;

  // Beam breathing + dust run only while the section is near the viewport and the tab is visible.
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let onScreen = false;
    const update = () => setRunning(onScreen && !document.hidden);
    const observer = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    }, { rootMargin: "100px 0px" });
    observer.observe(section);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Split into words (wording unchanged); "brought to life." stays together under its underline.
  const finaleAt = QUOTE.endsWith(FINALE) ? QUOTE.length - FINALE.length : -1;
  const lead = (finaleAt >= 0 ? QUOTE.slice(0, finaleAt) : QUOTE).trim().split(" ");
  const finale = finaleAt >= 0 ? FINALE.split(" ") : [];

  let k = 0;
  const word = (w: string) => {
    const i = k++;
    return (
      <motion.span
        key={`${w}-${i}`}
        className="inline-block"
        initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={on ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
        transition={{ duration: 0.6, delay: T.words + i * T.wordStagger, ease: EASE }}
      >
        <Token word={w} />
      </motion.span>
    );
  };
  const spaced = (words: string[]) => words.flatMap((w, i) => (i ? [" ", word(w)] : [word(w)]));

  return (
    <section ref={sectionRef} data-paused={running ? undefined : ""} className="relative overflow-x-clip bg-white">
      <style>{PREMIERE_CSS}</style>
      <figure data-premiere={on ? "on" : undefined} className="relative max-w-[980px] mx-auto px-6 sm:px-10 text-center">
        {/* Projector beam from above the mark, with drifting dust (decorative) */}
        <div
          aria-hidden="true"
          className="pm-beam pointer-events-none absolute left-1/2 -translate-x-1/2 -top-10 bottom-0 w-[115%] sm:w-[105%]"
          style={{
            clipPath: "polygon(44% 0, 56% 0, 100% 100%, 0 100%)",
            background: "linear-gradient(to bottom, rgba(255,214,170,0.08), rgba(255,236,214,0.05) 55%, rgba(255,255,255,0))",
          }}
        >
          {DUST.map((d, i) => (
            <span
              key={i}
              className={`pm-dust absolute rounded-full ${i >= 6 ? "hidden sm:block" : ""}`}
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: d.size,
                height: d.size,
                background: d.orange ? "rgba(255,90,31,0.22)" : "rgba(14,59,140,0.18)",
                ["--dur" as string]: `${d.dur}s`,
                ["--delay" as string]: `${d.delay}s`,
                ["--dx" as string]: `${d.dx}px`,
                ["--dy" as string]: `${d.dy}px`,
              }}
            />
          ))}
        </div>

        {/* The play mark (shared LogoMark artwork, animated from outside) */}
        <div aria-hidden="true" className="pm-mark relative flex justify-center">
          <LogoMark className="w-28 h-14" />
        </div>

        <div ref={blockRef} className="relative mt-10">
          {/* Cinema masking that opens */}
          <span aria-hidden="true" className="pm-letterbox-top pointer-events-none absolute inset-x-0 bottom-full h-10 bg-brand-navy/[0.06]" />
          <span aria-hidden="true" className="pm-letterbox-bottom pointer-events-none absolute inset-x-0 top-full h-10 bg-brand-navy/[0.06]" />

          {/* Typographic quote marks, outside the text block */}
          <span aria-hidden="true" className="pointer-events-none absolute -left-1 sm:-left-6 -top-6 sm:-top-10 font-['Cormorant_Garamond',Georgia,serif] italic text-[4.5rem] sm:text-[7rem] leading-none text-brand-orange/25">
            “
          </span>
          <span aria-hidden="true" className="pointer-events-none absolute -right-1 sm:-right-6 -bottom-12 sm:-bottom-20 font-['Cormorant_Garamond',Georgia,serif] italic text-[4.5rem] sm:text-[7rem] leading-none text-brand-orange/25">
            ”
          </span>

          <blockquote
            className="relative overflow-hidden px-2 pb-2 font-['Cormorant_Garamond',Georgia,serif] italic font-medium text-ink"
            style={{ fontSize: "clamp(2rem, 4.2vw, 3.6rem)", lineHeight: 1.15, textWrap: "balance" }}
          >
            <p>
              {spaced(lead)}
              {finale.length > 0 && (
                <>
                  {" "}
                  <span className="relative inline-block whitespace-nowrap">
                    {spaced(finale)}
                    <span
                      aria-hidden="true"
                      className="pm-underline absolute left-0 right-0 -bottom-[0.04em] h-[2px] rounded-full"
                      style={{ background: "linear-gradient(to right, #0E3B8C, #FF5A1F)" }}
                    />
                  </span>
                </>
              )}
            </p>
            {/* One soft light sweep across the text */}
            <span
              aria-hidden="true"
              className="pm-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4"
              style={{ background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))" }}
            />
          </blockquote>
        </div>

        <figcaption className="pm-attribution mt-10 flex items-center justify-center gap-3 sm:gap-4">
          <span aria-hidden="true" className="h-px w-6 sm:w-10 shrink-0 bg-brand-orange/50" />
          <span className="min-w-0 font-heading font-semibold text-xs leading-relaxed tracking-[0.3em] text-brand-orange">{ATTRIBUTION}</span>
          <span aria-hidden="true" className="h-px w-6 sm:w-10 shrink-0 bg-brand-orange/50" />
        </figcaption>
      </figure>
    </section>
  );
};
