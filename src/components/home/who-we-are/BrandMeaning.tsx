import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { BRAND_MEANING, EASE_OUT, TAGLINE_ACCENTS, WHO_WE_ARE_MOTION as M } from "./whoWeAreData";

/** Classical inscription face — used only inside this block. */
export const SERIF_ITALIC: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  fontStyle: "italic",
};

type Stage = "hidden" | "joined" | "split";

/** Tagline as word tokens, keeping the colour accents ("Converge", "Takes Shape"); spaces stay plain text. */
const taglineTokens = () => {
  const segments: { text: string; className?: string }[] = [];
  let rest = BRAND_MEANING.tagline;
  while (rest) {
    const hit = TAGLINE_ACCENTS.map((a) => ({ a, i: rest.indexOf(a.text) }))
      .filter((h) => h.i >= 0)
      .sort((x, y) => x.i - y.i)[0];
    if (!hit) {
      segments.push({ text: rest });
      break;
    }
    if (hit.i > 0) segments.push({ text: rest.slice(0, hit.i) });
    segments.push({ text: hit.a.text, className: hit.a.className });
    rest = rest.slice(hit.i + hit.a.text.length);
  }
  return segments.flatMap((seg) => seg.text.split(/(\s+)/).filter(Boolean).map((t) => ({ t, className: seg.className })));
};

/** Converge & Take Shape: "MIXTCAST" appears as one word, splits into MIXT + CAST, their meanings rise beneath,
 *  then the statement writes in and the tagline takes shape. */
export const BrandMeaning: React.FC<{ active: boolean; reduced: boolean }> = ({ active, reduced }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const mixtRef = useRef<HTMLSpanElement>(null);
  const castRef = useRef<HTMLSpanElement>(null);
  const [offsets, setOffsets] = useState({ mixt: 0, cast: 0 });
  const [stage, setStage] = useState<Stage>(reduced ? "split" : "hidden");

  // Where each half must start so the two read as one centred word "MIXTCAST".
  useLayoutEffect(() => {
    if (reduced) return;
    // Measured from the (untransformed) column boxes so a re-measure mid-animation stays correct.
    const measure = () => {
      const grid = gridRef.current?.getBoundingClientRect();
      const mCol = mixtRef.current?.parentElement?.getBoundingClientRect();
      const cCol = castRef.current?.parentElement?.getBoundingClientRect();
      const mW = mixtRef.current?.offsetWidth ?? 0;
      const cW = castRef.current?.offsetWidth ?? 0;
      if (!grid || !mCol || !cCol) return;
      const mLeft = mCol.left + (mCol.width - mW) / 2; // words are centred in their columns
      const cLeft = cCol.left + (cCol.width - cW) / 2;
      const left = grid.left + grid.width / 2 - (mW + cW) / 2;
      setOffsets({ mixt: left - mLeft, cast: left + mW - cLeft });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reduced]);

  useEffect(() => {
    if (!active || reduced) return;
    const timers = [
      window.setTimeout(() => setStage("joined"), M.brandAt * 1000),
      window.setTimeout(() => setStage("split"), M.brandSplitAt * 1000),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active, reduced]);

  const split = stage === "split";
  const wordState = (offset: number) =>
    stage === "hidden" ? { opacity: 0, x: offset } : stage === "joined" ? { opacity: 1, x: offset } : { opacity: 1, x: 0 };
  const wordTransition = { duration: stage === "split" ? 0.5 : 0.35, ease: EASE_OUT };
  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 8 },
    animate: split ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    transition: { duration: 0.5, delay: reduced ? 0 : delay, ease: EASE_OUT },
  });
  const statementWords = BRAND_MEANING.statement.split(" ");
  const tagline = taglineTokens();
  let wordIndex = 0;
  const shown = active || reduced;
  const writeIn = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 6 },
    animate: shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
    transition: { duration: 0.45, delay: reduced ? 0 : delay, ease: EASE_OUT },
  });

  const column = (part: typeof BRAND_MEANING.mixt, wordRef: React.Ref<HTMLSpanElement>, offset: number, color: string, delay: number) => (
    <div>
      <motion.span
        ref={wordRef}
        className={`inline-block font-heading font-bold text-lg sm:text-xl tracking-[0.18em] ${color}`}
        initial={reduced ? false : wordState(offset)}
        animate={wordState(offset)}
        transition={wordTransition}
      >
        {part.word}
      </motion.span>
      <motion.p className="mt-1 text-[15px] sm:text-base text-ink-muted leading-snug" style={{ ...SERIF_ITALIC, fontWeight: 500 }} {...rise(delay)}>
        {part.origin}
      </motion.p>
      <motion.p className="mt-1 text-xs sm:text-[13px] text-[#5B6470] leading-snug" {...rise(delay + 0.12)}>
        {part.meaning}
      </motion.p>
    </div>
  );

  return (
    <div className="rounded-2xl border border-line bg-white/80 lg:bg-white/70 lg:backdrop-blur-sm px-5 py-4 sm:px-6 sm:py-5 text-center">
      <div ref={gridRef} className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-6">
        {column(BRAND_MEANING.mixt, mixtRef, offsets.mixt, "text-brand-navy", 0.2)}

        {/* Hairline separator: a tiny waveform that draws in */}
        <svg aria-hidden="true" viewBox="0 0 10 64" className="w-2.5 h-14 sm:h-16 mt-1" fill="none">
          <motion.path
            d="M5 0 V14 L2 18 L8 24 L1 30 L9 36 L3 42 L7 47 L5 50 V64"
            stroke="url(#mixtcast-hairline)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={split ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />
          <defs>
            <linearGradient id="mixtcast-hairline" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#0E3B8C" />
              <stop offset="1" stopColor="#FF5A1F" />
            </linearGradient>
          </defs>
        </svg>

        {column(BRAND_MEANING.cast, castRef, offsets.cast, "text-brand-orange", 0.3)}
      </div>

      {/* Statement writes in word by word */}
      <p data-narration-target="wwa-statement" className="mt-4 text-lg sm:text-xl text-ink leading-snug" style={{ ...SERIF_ITALIC, fontWeight: 600 }}>
        {statementWords.map((word, i) => (
          <React.Fragment key={i}>
            <motion.span className="inline-block" {...writeIn(M.statementAt + i * M.statementStagger)}>
              {word}
            </motion.span>
            {i < statementWords.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </p>

      {/* Tagline takes shape last, with a navy → orange line drawing beneath it */}
      <div className="mt-3 inline-block">
        <p data-narration-target="wwa-tagline" className="font-heading font-semibold text-sm sm:text-[15px] text-ink tracking-[0.08em] [font-variant-caps:all-small-caps]">
          {tagline.map(({ t, className }, i) =>
            /^\s+$/.test(t) ? (
              <React.Fragment key={i}>{t}</React.Fragment>
            ) : (
              <motion.span key={i} className={`inline-block ${className ?? ""}`} {...writeIn(M.taglineAt + wordIndex++ * M.taglineStagger)}>
                {t}
              </motion.span>
            )
          )}
        </p>
        <motion.span
          aria-hidden="true"
          className="block mx-auto mt-1.5 h-[2px] w-3/4 rounded-full bg-gradient-to-r from-brand-navy to-brand-orange origin-center"
          initial={reduced ? false : { scaleX: 0 }}
          animate={shown ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.5, delay: reduced ? 0 : M.taglineLineAt, ease: EASE_OUT }}
        />
      </div>
    </div>
  );
};
