import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, animate, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { SolutionSpace } from "../../data/solutions";
import { fadeOutAll } from "../../lib/sound";

interface SpacesShowcaseProps {
  spaces: SolutionSpace[];
  /** Autoplay starts only once the hero has been revealed. */
  active: boolean;
  /** Scroll to a space's section on the page. */
  onExplore: (slug: string) => void;
  /** Placement classes from the parent layout. */
  className?: string;
}

export const SHOWCASE_TIMING = {
  slideMs: 5000,
  transitionMs: 900,
  kenBurnsScale: 1.08,
};

const srcSetFor = (photo: string) => `${photo.replace(".webp", "-800.webp")} 800w, ${photo} 1600w`;
const SIZES = "(min-width: 1024px) 680px, 92vw";

/** Cinematic "screen" on the Solutions stage: an auto-playing carousel of every space. */
export const SpacesShowcase: React.FC<SpacesShowcaseProps> = ({ spaces, active, onExplore, className = "" }) => {
  const total = spaces.length;
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const regionRef = useRef<HTMLElement>(null);
  const progress = useMotionValue(0);
  const swipeStart = useRef<number | null>(null);
  const changes = useRef(0);

  const autoplay = active && !reduceMotion && !userPaused;
  const playing = autoplay && !hovered && !focused && inView && !pageHidden;

  const goTo = useCallback(
    (next: number) => {
      const target = (next + total) % total;
      if (target === index) return;
      changes.current += 1;
      progress.set(0);
      setPrevious(index);
      setIndex(target);
    },
    [index, total, progress]
  );

  // Advance when the progress bar fills; pausing keeps the current progress.
  useEffect(() => {
    if (!playing) return;
    const remaining = (1 - progress.get()) * SHOWCASE_TIMING.slideMs;
    const controls: AnimationPlaybackControls = animate(progress, 1, {
      duration: remaining / 1000,
      ease: "linear",
      onComplete: () => goTo(index + 1),
    });
    return () => controls.stop();
  }, [playing, index, goTo, progress]);

  // Drop the outgoing slide once the crossfade has finished.
  useEffect(() => {
    if (previous === null) return;
    const t = window.setTimeout(() => setPrevious(null), SHOWCASE_TIMING.transitionMs + 50);
    return () => window.clearTimeout(t);
  }, [previous, index]);

  // Pause when off-screen or when the tab is hidden.
  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    const onVisibility = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  // Render the current slide, the outgoing one (crossfade) and the next one (preload). Others stay unloaded.
  const nextIndex = (index + 1) % total;
  const mounted = Array.from(new Set([previous, index, nextIndex].filter((i): i is number => i !== null)));
  const fade = reduceMotion ? 0.2 : SHOWCASE_TIMING.transitionMs / 1000;

  return (
    <section
      ref={regionRef}
      aria-roledescription="carousel"
      aria-label="Solutions spaces showcase"
      onKeyDown={onKeyDown}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      className={`relative w-full text-left ${className}`}
    >
      {/* Ambient stage glow behind the screen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -inset-y-8 -z-0 rounded-[40px]"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 45%, rgba(255,90,31,0.10), rgba(14,59,140,0.05) 55%, transparent 75%)" }}
      />

      {/* Screen with a thin navy → orange frame */}
      <div className="relative rounded-[20px] p-[1.5px] bg-gradient-to-r from-brand-navy via-brand-navy/70 to-brand-orange shadow-[0_24px_60px_-28px_rgba(14,59,140,0.45)]">
        <div
          className="relative overflow-hidden rounded-[18.5px] bg-[#0A2A63] aspect-[4/3] md:aspect-video lg:aspect-[16/10] lg:max-h-[min(62vh,560px)] touch-pan-y select-none"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeStart.current = null)}
          aria-live={playing ? "off" : "polite"}
        >
          {mounted.map((i) => {
            const space = spaces[i];
            const isCurrent = i === index;
            return (
              <motion.div
                key={space.slug}
                role="group"
                aria-roledescription="slide"
                aria-label={`Space ${i + 1} of ${total}: ${space.title}`}
                aria-hidden={!isCurrent}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: isCurrent ? 1 : 0 }}
                transition={{ duration: fade, ease: "easeInOut" }}
                style={{ zIndex: isCurrent ? 2 : 1 }}
              >
                <motion.img
                  src={space.photo}
                  srcSet={srcSetFor(space.photo)}
                  sizes={SIZES}
                  alt={space.photoAlt}
                  width={1600}
                  height={1067}
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transformOrigin: i % 2 ? "30% 40%" : "70% 60%" }}
                  initial={{ scale: 1, x: "0%" }}
                  animate={
                    isCurrent && !reduceMotion
                      ? { scale: SHOWCASE_TIMING.kenBurnsScale, x: i % 2 ? "1.5%" : "-1.5%" }
                      : { scale: 1, x: "0%" }
                  }
                  transition={{ duration: (SHOWCASE_TIMING.slideMs + SHOWCASE_TIMING.transitionMs) / 1000, ease: "linear" }}
                />

                {isCurrent && (
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 sm:px-6 pb-3 sm:pb-5 pt-14 bg-gradient-to-t from-black/75 via-black/35 to-transparent">
                    <div className="min-w-0">
                      <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-brand-orange-soft">
                        Space {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-sm sm:text-xl font-bold text-white font-heading leading-snug line-clamp-2 sm:line-clamp-1">
                        {space.title}
                      </h3>
                      <p className="hidden sm:block text-xs sm:text-sm text-white/80 line-clamp-1">{space.tagline}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onExplore(space.slug)}
                      aria-label={`Explore this space: ${space.title}`}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
                    >
                      <span className="hidden sm:inline">Explore this space</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Projector light sweep between slides */}
          {!reduceMotion && changes.current > 0 && (
            <motion.div
              key={`sweep-${changes.current}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 z-[3]"
              style={{
                background:
                  "linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,240,225,0.28) 45%, rgba(255,255,255,0.4) 50%, rgba(255,240,225,0.28) 55%, rgba(255,255,255,0) 100%)",
              }}
              initial={{ x: "0%", opacity: 0 }}
              animate={{ x: "300%", opacity: [0, 1, 1, 0] }}
              transition={{ duration: SHOWCASE_TIMING.transitionMs / 1000, ease: [0.45, 0, 0.25, 1] }}
            />
          )}

          {/* Subtle inner shadow */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[4] rounded-[18.5px] shadow-[inset_0_0_48px_rgba(0,0,0,0.35)]" />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            // Pausing the slideshow also fades out the curtain music.
            if (!userPaused) fadeOutAll(600);
            setUserPaused((p) => !p);
          }}
          disabled={!!reduceMotion}
          aria-label={autoplay ? "Pause showcase" : "Play showcase"}
          className="shrink-0 w-8 h-8 rounded-full border border-line bg-white text-brand-navy inline-flex items-center justify-center hover:border-brand-navy disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
        >
          {autoplay ? <Pause className="w-3.5 h-3.5" aria-hidden="true" /> : <Play className="w-3.5 h-3.5" aria-hidden="true" />}
        </button>

        <div className="flex-1 flex items-center gap-1.5">
          {spaces.map((space, i) => (
            <button
              key={space.slug}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show space ${i + 1}: ${space.title}`}
              aria-current={i === index ? "true" : undefined}
              className="group flex-1 py-2 focus-visible:outline-none"
            >
              <span className="block h-[3px] rounded-full bg-brand-navy/15 overflow-hidden group-hover:bg-brand-navy/25 group-focus-visible:ring-2 group-focus-visible:ring-[#FF5A1F]">
                {i === index ? (
                  <motion.span
                    className="block h-full bg-gradient-to-r from-brand-navy to-brand-orange origin-left"
                    style={{ scaleX: reduceMotion ? 1 : progress }}
                  />
                ) : (
                  <span className={`block h-full origin-left bg-brand-navy/40 ${i < index ? "scale-x-100" : "scale-x-0"}`} />
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous space"
            className="w-8 h-8 rounded-full border border-line bg-white text-brand-navy inline-flex items-center justify-center hover:border-brand-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next space"
            className="w-8 h-8 rounded-full border border-line bg-white text-brand-navy inline-flex items-center justify-center hover:border-brand-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};
