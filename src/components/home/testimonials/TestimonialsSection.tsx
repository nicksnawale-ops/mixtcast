import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { TESTIMONIALS, type Testimonial } from "../../../data/testimonials";

/**
 * Home "Client Voices": the client testimonials (verbatim, from data/testimonials.ts) as an open editorial carousel —
 * stars, the quote in Poppins, a per-quote "voiceprint" and the attribution. Auto-advances every 8s (paused
 * on hover/focus, off-screen, tab hidden, or by the pause button); prev/next, progress bars, swipe on touch.
 * Reduced motion: no autoplay, no blur/word reveal; instant switching.
 */

const SLIDE_MS = 8000;
const EASE = [0.22, 1, 0.36, 1] as const;
const REVEAL_S = 0.3; // the word-by-word reveal is spread over at most this (35ms stagger, capped to keep a switch short)
const VOICE_W = 220;
const VOICE_H = 28;

/** A deterministic waveform from the quote text (its "voiceprint"). */
const voiceprint = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  const r = (k: number) => (((h >>> (k % 24)) ^ (h * (k + 7))) & 1023) / 1023;
  const f1 = 3 + r(1) * 5;
  const f2 = 9 + r(2) * 9;
  const f3 = 17 + r(3) * 11;
  const p1 = r(4) * 6.28;
  const p2 = r(5) * 6.28;
  let d = "";
  for (let i = 0; i <= 90; i++) {
    const t = i / 90;
    const env = Math.sin(Math.PI * t) ** 0.8;
    const y = VOICE_H / 2 - env * (VOICE_H / 2 - 2) * (0.55 * Math.sin(2 * Math.PI * f1 * t + p1) + 0.3 * Math.sin(2 * Math.PI * f2 * t + p2) + 0.15 * Math.sin(2 * Math.PI * f3 * t));
    d += `${i ? "L" : "M"}${(t * VOICE_W).toFixed(1)} ${y.toFixed(2)} `;
  }
  return d.trim();
};

const Star: React.FC = () => (
  <svg viewBox="0 0 20 20" width={16} height={16} aria-hidden="true">
    <path d="M10 1.6l2.47 5.3 5.8.68-4.3 3.96 1.15 5.73L10 14.4l-5.12 2.87 1.15-5.73L1.73 7.58l5.8-.68z" fill="#FF5A1F" />
  </svg>
);

const CSS = `
.tv-voice { stroke-dasharray: 1 1; stroke-dashoffset: 1; animation: tv-draw 650ms cubic-bezier(0.22, 1, 0.36, 1) 150ms both; }
@keyframes tv-draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { .tv-voice { animation: none; stroke-dashoffset: 0; } }
`;

const Slide: React.FC<{ t: Testimonial; index: number; total: number; play: boolean; reduced: boolean }> = ({ t, index, total, play, reduced }) => {
  const words = t.quote.split(" ");
  const stagger = Math.min(0.035, REVEAL_S / words.length);
  const voice = useMemo(() => voiceprint(t.quote), [t.quote]);
  const gid = `tv-grad-${useId().replace(/:/g, "")}`;
  return (
    <motion.div
      role="group"
      aria-roledescription="slide"
      aria-label={`Testimonial ${index + 1} of ${total}`}
      className="relative"
      initial={false}
      exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.2, ease: "easeIn" } }}
    >
      {/* Stars pop in one by one */}
      <div role="img" aria-label={`Rated ${t.rating} out of 5`} className="flex items-center gap-1 mb-5 justify-center">
        {Array.from({ length: t.rating }, (_, i) => (
          <motion.span
            key={i}
            className="inline-flex"
            initial={reduced ? false : { opacity: 0, scale: 0.4 }}
            animate={play ? { opacity: 1, scale: [0.4, 1.2, 1] } : undefined}
            transition={{ duration: 0.35, delay: 0.05 + i * 0.06, times: [0, 0.6, 1], ease: EASE }}
          >
            <Star />
          </motion.span>
        ))}
      </div>

      <blockquote className="text-center">
        <p className="font-heading font-medium not-italic text-ink" style={{ fontSize: "clamp(1.125rem, 1.8vw, 1.5rem)", lineHeight: 1.6, letterSpacing: "-0.005em" }}>
          {words.map((w, i) => (
            <React.Fragment key={i}>
              {i > 0 && " "}
              <motion.span
                className="inline-block"
                initial={reduced ? false : { opacity: 0, filter: "blur(6px)" }}
                animate={play ? { opacity: 1, filter: "blur(0px)" } : undefined}
                transition={{ duration: 0.3, delay: 0.08 + i * stagger, ease: EASE }}
              >
                {w}
              </motion.span>
            </React.Fragment>
          ))}
        </p>

        {/* Voiceprint: unique to this quote, redrawn each time it appears */}
        <svg aria-hidden="true" className="mt-6 mx-auto block overflow-visible" width={VOICE_W} height={VOICE_H} viewBox={`0 0 ${VOICE_W} ${VOICE_H}`} fill="none">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0E3B8C" />
              <stop offset="1" stopColor="#FF5A1F" />
            </linearGradient>
          </defs>
          {play && <path className="tv-voice" d={voice} pathLength={1} stroke={`url(#${gid})`} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />}
        </svg>

        <footer className="mt-6 flex items-center justify-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-brand-orange shrink-0" />
          <cite className="not-italic text-sm text-center">
            <span className="font-heading font-semibold text-ink">{t.author}</span>
            <span className="text-ink-muted"> — {t.organization}</span>
          </cite>
          <span aria-hidden="true" className="h-px w-8 bg-brand-orange shrink-0" />
        </footer>
      </blockquote>
    </motion.div>
  );
};

/** Faint waveform watermark behind the quote stage (static). */
const Watermark: React.FC = () => {
  const d = useMemo(() => {
    let s = "";
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const env = 0.3 + 0.7 * Math.sin(Math.PI * t);
      const y = 50 - (Math.sin(t * Math.PI * 2 * 6) * 0.65 + Math.sin(t * Math.PI * 2 * 15 + 1) * 0.35) * env * 42;
      s += `${i ? "L" : "M"}${(t * 1000).toFixed(1)} ${y.toFixed(1)} `;
    }
    return s;
  }, []);
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-[260px]" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="none">
      <path d={d} stroke="rgba(14,59,140,0.03)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export const TestimonialsSection: React.FC = () => {
  const reduced = !!useReducedMotion();
  const total = TESTIMONIALS.length;
  const sectionRef = useRef<HTMLElement>(null);
  const entered = useInView(sectionRef, { once: true, amount: 0.3 }) || reduced;
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(!reduced);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  const [announce, setAnnounce] = useState("");
  const progress = useMotionValue(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    observer.observe(el);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const goTo = useCallback(
    (next: number, byUser = false) => {
      const i = ((next % total) + total) % total;
      progress.set(0);
      setIndex(i);
      if (byUser) setAnnounce(`Testimonial ${i + 1} of ${total}: ${TESTIMONIALS[i].author}, ${TESTIMONIALS[i].organization}`);
    },
    [total, progress],
  );

  // Auto-advance when the current bar fills; pausing keeps the bar where it is.
  const playing = autoplay && !reduced && entered && onScreen && tabVisible && !hovering && !focused;
  useEffect(() => {
    if (!playing) return;
    const controls: AnimationPlaybackControls = animate(progress, 1, {
      duration: ((1 - progress.get()) * SLIDE_MS) / 1000,
      ease: "linear",
      onComplete: () => goTo(index + 1),
    });
    return () => controls.stop();
  }, [playing, index, goTo, progress]);

  const fadeUp = (delay: number) =>
    reduced
      ? { initial: false as const }
      : { initial: { opacity: 0, y: 16 }, animate: entered ? { opacity: 1, y: 0 } : undefined, transition: { duration: 0.6, delay, ease: EASE } };

  const btn =
    "w-10 h-10 rounded-full border border-brand-navy/40 text-brand-navy inline-flex items-center justify-center hover:border-brand-navy hover:bg-brand-navy hover:text-white transition-colors outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange";

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <style>{CSS}</style>
      <div className="text-center max-w-2xl mx-auto mb-10">
        <motion.span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2" {...fadeUp(0)}>
          Testimonials
        </motion.span>
        <motion.h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading" {...fadeUp(0.1)}>
          What Our Clients Say About MixtCast
        </motion.h2>
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Client testimonials"
        className="relative max-w-[880px] mx-auto"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goTo(index + 1, true);
          if (e.key === "ArrowLeft") goTo(index - 1, true);
        }}
      >
        <Watermark />

        {/* Decorative opening quote */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 lg:-top-14 font-heading font-bold not-italic text-[7rem] lg:text-[9rem] leading-none text-brand-orange/20 select-none"
          initial={reduced ? false : { opacity: 0, scale: 0.6 }}
          animate={entered ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        >
          “
        </motion.span>

        {/* Slides (swipe on touch) */}
        <motion.div
          className="relative grid pt-12 lg:pt-14 touch-pan-y"
          drag={reduced ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) goTo(index + 1, true);
            else if (info.offset.x > 60) goTo(index - 1, true);
          }}
        >
          {/* Invisible copies reserve the tallest testimonial's height, so switching never shifts the page */}
          {TESTIMONIALS.map((t, i) => (
            <div key={i} aria-hidden="true" className="invisible [grid-area:1/1]">
              <Slide t={t} index={i} total={total} play={false} reduced />
            </div>
          ))}
          <div className="[grid-area:1/1]">
            <AnimatePresence mode="wait" initial={false}>
              <Slide key={index} t={TESTIMONIALS[index]} index={index} total={total} play={entered} reduced={reduced} />
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="relative mt-8 flex items-center justify-center gap-3">
          <button type="button" onClick={() => setAutoplay((a) => !a)} aria-label={autoplay ? "Pause testimonials" : "Play testimonials"} className={btn}>
            {autoplay ? <Pause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4" aria-hidden="true" />}
          </button>
          <div className="flex-1 max-w-[420px] flex items-center gap-2">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.organization}
                type="button"
                onClick={() => goTo(i, true)}
                aria-label={`Show testimonial ${i + 1}: ${t.author}, ${t.organization}`}
                aria-current={i === index ? "true" : undefined}
                className="group flex-1 py-3 outline-none"
              >
                <span className="block h-[3px] rounded-full bg-brand-navy/15 overflow-hidden group-hover:bg-brand-navy/25 group-focus-visible:outline-solid group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-brand-orange">
                  {i === index ? (
                    <motion.span className="block h-full bg-gradient-to-r from-brand-navy to-brand-orange origin-left" style={{ scaleX: reduced ? 1 : progress }} />
                  ) : (
                    <span className={`block h-full origin-left bg-brand-navy/40 ${i < index ? "scale-x-100" : "scale-x-0"}`} />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button type="button" onClick={() => goTo(index - 1, true)} aria-label="Previous testimonial" className={btn}>
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => goTo(index + 1, true)} aria-label="Next testimonial" className={btn}>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Announces slide changes the visitor made (not autoplay) */}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announce}
        </p>
      </div>
    </section>
  );
};
