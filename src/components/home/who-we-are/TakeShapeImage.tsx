import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ImageWithFallback } from "../../ui/ImageWithFallback";
import { SonicHalo } from "./SonicHalo";
import { EASE_OUT, WHO_WE_ARE_MOTION as M } from "./whoWeAreData";
import { SLIDESHOW, WHO_WE_ARE_SLIDES as SLIDES } from "../../../data/whoWeAreSlides";

const SIZES = "(min-width: 1024px) 600px, calc(100vw - 2rem)";
const srcSetOf = (s: (typeof SLIDES)[number]) => `${s.image800} 800w, ${s.image} ${s.width}w`;

interface TakeShapeImageProps {
  active: boolean;
  reduced: boolean;
  /** Desktop: the image takes shape from its left edge (where the streams converge); otherwise from the centre. */
  isDesktop: boolean;
  /** Desktop: where the streams land on the left edge, as a fraction of the frame height (default: the middle). */
  convergeY?: number;
  /** The Who We Are narration is playing: the slideshow holds still. */
  narrating?: boolean;
}

const MAX_TILT = 5; // degrees

/** The featured image takes shape through a soft expanding projector-light mask, then a slow Ken Burns. */
export const TakeShapeImage = forwardRef<HTMLDivElement, TakeShapeImageProps>(({ active, reduced, isDesktop, convergeY = 0.5, narrating = false }, ref) => {
  const rotateX = useSpring(0, { stiffness: 120, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 18 });
  const origin = isDesktop ? `0% ${(convergeY * 100).toFixed(1)}%` : "50% 50%";
  const takeShapeAt = isDesktop ? M.takeShapeAt : M.takeShapeAtMobile;
  const shown = active || reduced;

  // Frame size, so the projector "iris" can be centred on the point where the streams converge.
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const setRefs = (el: HTMLDivElement | null) => {
    frameRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  // Projector reveal using transforms only: a circular iris scales up from the meeting point while the
  // image inside counter-scales, so it stays put. (A clip-path animation would repaint every frame.)
  // Starts at 12% (faded in) — a tiny start would force a huge counter-scale on the image layer.
  const iris = useMotionValue(reduced ? 1 : 0.12);
  const irisOpacity = useMotionValue(reduced ? 1 : 0);
  const counter = useTransform(iris, (v) => 1 / v);
  useEffect(() => {
    if (!shown || reduced) return;
    const delay = takeShapeAt;
    const a = animate(iris, 1, { duration: M.takeShapeDuration, delay, ease: [0.45, 0, 0.2, 1] });
    const b = animate(irisOpacity, 1, { duration: 0.25, delay, ease: "easeOut" });
    return () => {
      a.stop();
      b.stop();
    };
  }, [shown, reduced, takeShapeAt, iris, irisOpacity]);
  const o = { x: isDesktop ? 0 : size.w / 2, y: isDesktop ? size.h * convergeY : size.h / 2 };
  const reach = 2 * Math.max(...[[0, 0], [size.w, 0], [0, size.h], [size.w, size.h]].map(([x, y]) => Math.hypot(x - o.x, y - o.y)));

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || reduced || !isDesktop) return;
    const r = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 2 * MAX_TILT);
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * MAX_TILT);
  };
  // Sonic halo behind the frame: starts once the projector reveal has finished; parallax opposite to the tilt.
  const [haloOn, setHaloOn] = useState(reduced);
  useEffect(() => {
    if (!shown || reduced) return;
    const t = window.setTimeout(() => setHaloOn(true), (takeShapeAt + M.takeShapeDuration) * 1000);
    return () => window.clearTimeout(t);
  }, [shown, reduced, takeShapeAt]);
  const haloX = useTransform(rotateY, (v) => -v * 2); // ±5° tilt → ±10px
  const haloY = useTransform(rotateX, (v) => v * 2);

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  };

  // ── Slideshow: starts after the projector reveal; one slide every ~5.5s, looping. Holds while hovered/focused,
  // off-screen, tab hidden or during the narration. Reduced motion: slide 1 only. ────────────────────────────────
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(() => typeof document !== "undefined" && document.hidden);
  useEffect(() => {
    if (!shown || reduced) return;
    const t = window.setTimeout(() => setStarted(true), (takeShapeAt + M.takeShapeDuration + SLIDESHOW.startAfterRevealS) * 1000);
    return () => window.clearTimeout(t);
  }, [shown, reduced, takeShapeAt]);
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.2 });
    observer.observe(el);
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  const playing = started && !reduced && !hovered && !focused && onScreen && !tabHidden && !narrating;
  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDESHOW.intervalS * 1000);
    return () => window.clearTimeout(t);
  }, [playing, index]);
  // Preload only the next slide (the browser picks the 800w / full file from the same srcSet + sizes).
  useEffect(() => {
    if (!started || reduced) return;
    const next = SLIDES[(index + 1) % SLIDES.length];
    const img = new Image();
    img.sizes = SIZES;
    img.srcset = srcSetOf(next);
    img.src = next.image;
  }, [started, reduced, index]);
  const slide = SLIDES[index];

  return (
    <div className="relative [perspective:1200px]">
      <SonicHalo started={haloOn} reduced={reduced} isDesktop={isDesktop} frame={size} parallaxX={haloX} parallaxY={haloY} />
      <motion.div
        ref={setRefs}
        onPointerMove={onMove}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={onLeave}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        role="region"
        aria-roledescription="slideshow"
        aria-label="Featured environments"
        style={{ rotateX, rotateY }}
        className="relative z-10 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-line bg-surface-warm"
      >
        {/* Projector-light mask: an iris that expands from the convergence point to the full frame */}
        <motion.div
          data-iris
          className="absolute rounded-full overflow-hidden"
          style={{
            left: o.x - reach / 2,
            top: o.y - reach / 2,
            width: reach,
            height: reach,
            scale: iris,
            opacity: irisOpacity,
            willChange: "transform",
            visibility: size.w ? "visible" : "hidden",
          }}
        >
          <motion.div
            className="absolute"
            style={{ left: reach / 2 - o.x, top: reach / 2 - o.y, width: size.w, height: size.h, scale: counter, transformOrigin: `${o.x}px ${o.y}px` }}
          >
          <AnimatePresence initial={false}>
            <motion.div
              key={slide.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: SLIDESHOW.crossfadeS, ease: "easeInOut" }}
            >
              <motion.div
                initial={index === 0 ? false : { scale: 1 }}
                animate={shown && !reduced ? { scale: M.kenBurnsScale } : { scale: 1 }}
                transition={{
                  duration: M.kenBurnsDuration,
                  // Slide 1 starts its Ken Burns after the projector reveal (as before); later slides start from 1.00 at once.
                  delay: index === 0 && !started ? takeShapeAt + M.takeShapeDuration : 0,
                  ease: "linear",
                }}
                style={{ transformOrigin: "60% 45%", willChange: "transform" }}
              >
                <ImageWithFallback
                  src={slide.image}
                  srcSet={srcSetOf(slide)}
                  sizes={SIZES}
                  width={slide.width}
                  height={Math.round((slide.width * 3) / 4)}
                  alt={slide.alt}
                  fallbackTitle={slide.title}
                  category="Sound & Vision"
                  aspectRatioClass="aspect-4/3"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Brief warm projector flare at the convergence point */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${origin}, rgba(255,236,214,0.9) 0%, rgba(255,140,80,0.35) 22%, rgba(255,140,80,0) 55%)`,
            }}
            initial={{ opacity: 0 }}
            animate={active ? { opacity: [0, 1, 0] } : { opacity: 0 }}
            transition={{ duration: 0.9, delay: takeShapeAt, times: [0, 0.3, 1], ease: "easeOut" }}
          />
        )}

        {/* Caption card (glass) */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: reduced ? 0 : takeShapeAt + M.takeShapeDuration * 0.6, ease: EASE_OUT }}
          className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 lg:bg-white/70 lg:backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_-8px_rgba(14,59,140,0.25)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange block">
                  {slide.eyebrow}
                </span>
                {/* Live level meter */}
                <span aria-hidden="true" className="flex items-end gap-[2px] h-2.5">
                  {[0.6, 1, 0.75, 0.5].map((h, i) => (
                    <span
                      key={i}
                      className="wwa-meter-bar wwa-idle w-[2px] rounded-full bg-brand-orange/80"
                      style={{ height: `${h * 100}%`, animationDelay: `${i * 0.23}s` }}
                    />
                  ))}
                </span>
              </div>
              {/* Title swaps with a subtle fade + rise; changes aren't announced (aria-live off) */}
              <h3 className="text-sm font-bold text-brand-navy font-heading" aria-live="off">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={slide.id}
                    className="block"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: SLIDESHOW.titleS / 2 } }}
                    transition={{ duration: SLIDESHOW.titleS, ease: EASE_OUT }}
                  >
                    {slide.title}
                  </motion.span>
                </AnimatePresence>
              </h3>
            </div>
            {/* Location pill: only on company-owned photos (kept in the layout and faded, so the card never jumps) */}
            <motion.span
              aria-hidden={!slide.companyPhoto}
              initial={false}
              animate={{ opacity: slide.companyPhoto ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : SLIDESHOW.titleS }}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted bg-surface-warm/80 px-3 py-1 rounded-full border border-line"
            >
              <span aria-hidden="true" className="relative flex w-1.5 h-1.5">
                <span className="wwa-ping wwa-idle absolute inset-0 rounded-full bg-brand-orange" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-brand-orange" />
              </span>
              Pune, India
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
});
TakeShapeImage.displayName = "TakeShapeImage";
