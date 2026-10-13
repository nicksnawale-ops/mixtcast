import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ChevronRight } from "lucide-react";
import { COMPANY_INFO } from "../../../data/company";
import { Button } from "../../ui/Button";
import { BrandMeaning } from "./BrandMeaning";
import { FeatureCard } from "./FeatureCard";
import { TakeShapeImage } from "./TakeShapeImage";
import { EASE_OUT, WHO_WE_ARE_MOTION as M } from "./whoWeAreData";

const SERIF_FONT_HREF = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&display=swap";

// Headline split into words so it can slide up line by line; text is unchanged.
// "Immersive" and "Intelligent" carry the gradient underline (the comma stays outside it).
const HEADLINE: { word: string; underline?: boolean; trailing?: string }[] = [
  { word: "Crafting" },
  { word: "Immersive", underline: true, trailing: "," },
  { word: "Intelligent", underline: true },
  { word: "Audio-Visual" },
  { word: "Ecosystems" },
];

/** Section-scoped styles: idle meters/equalizers and the outlined inscription. */
const SCOPED_CSS = `
@keyframes wwa-eq { 0%, 100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
@keyframes wwa-meter { 0%, 100% { transform: scaleY(0.45); } 50% { transform: scaleY(1); } }
@keyframes wwa-ping { 0% { transform: scale(1); opacity: 0.55; } 80%, 100% { transform: scale(2.6); opacity: 0; } }
.wwa-eq-bar { transform-origin: bottom; transform: scaleY(0.35); }
.wwa-card[data-hover="true"] .wwa-eq-bar { animation: wwa-eq 0.9s ease-in-out infinite; }
.wwa-meter-bar { transform-origin: bottom; animation: wwa-meter 1.6s ease-in-out infinite; }
.wwa-ping { animation: wwa-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
.wwa-root[data-idle="paused"] .wwa-idle { animation-play-state: paused; }
.wwa-inscription { color: transparent; -webkit-text-stroke: 1px rgba(14, 59, 140, 0.07); }
@media (prefers-reduced-motion: reduce) { .wwa-root .wwa-idle { animation: none !important; } }
`;

/** Home "Who We Are": Converge & Take Shape. */
export const WhoWeAreSection: React.FC = () => {
  const reduced = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const active = useInView(sectionRef, { once: true, amount: M.inViewAmount });
  const onScreen = useInView(sectionRef, { amount: 0 });
  const [pageHidden, setPageHidden] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
  const [lineOf, setLineOf] = useState<number[]>(HEADLINE.map(() => 0));
  const [stream, setStream] = useState<{ x: number; y: number; length: number } | null>(null);

  // Load the classical italic face only when this section is used.
  useEffect(() => {
    if (document.querySelector(`link[href="${SERIF_FONT_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = SERIF_FONT_HREF;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    const onVisibility = () => setPageHidden(document.hidden);
    mq.addEventListener("change", onChange);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mq.removeEventListener("change", onChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Group headline words by rendered line, and measure where the converging streams travel (desktop).
  useLayoutEffect(() => {
    const measure = () => {
      const words = headlineRef.current?.querySelectorAll<HTMLElement>("[data-word]");
      if (words?.length) {
        const tops = Array.from(words).map((w) => w.offsetTop);
        const unique = Array.from(new Set(tops)).sort((a, b) => a - b);
        setLineOf(tops.map((t) => unique.indexOf(t)));
      }
      const grid = gridRef.current?.getBoundingClientRect();
      const left = leftRef.current?.getBoundingClientRect();
      const img = imageRef.current?.getBoundingClientRect();
      if (grid && left && img && isDesktop) {
        setStream({ x: left.right - grid.left, y: img.top + img.height / 2 - grid.top, length: img.left - left.right });
      } else setStream(null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isDesktop]);

  // Background inscription: slow horizontal parallax (max ±40px).
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const inscriptionX = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);

  // Extra magnetic pull on the button (the shared Button already adds up to 4px → 6px max in total).
  const magnetX = useSpring(0, { stiffness: 300, damping: 20 });
  const magnetY = useSpring(0, { stiffness: 300, damping: 20 });
  const onButtonMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    magnetX.set(Math.max(-2, Math.min(2, (e.clientX - (r.left + r.width / 2)) * 0.05)));
    magnetY.set(Math.max(-2, Math.min(2, (e.clientY - (r.top + r.height / 2)) * 0.05)));
  };

  const shown = active || reduced;
  const fadeUp = (delay: number, y = 14) => ({
    initial: reduced ? false : { opacity: 0, y },
    animate: shown ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 0.6, delay: reduced ? 0 : delay, ease: EASE_OUT },
  });

  return (
    <section
      ref={sectionRef}
      className="wwa-root relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-clip"
      data-idle={onScreen && !pageHidden ? "running" : "paused"}
    >
      <style>{SCOPED_CSS}</style>

      {/* Outlined background inscription */}
      <motion.div
        aria-hidden="true"
        style={{ x: inscriptionX, willChange: "transform" }}
        className="wwa-inscription pointer-events-none select-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center whitespace-nowrap font-heading font-extrabold leading-none text-[13vw] lg:text-[11rem] tracking-tight"
      >
        MIXT · CAST
      </motion.div>

      <div ref={gridRef} className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-x-20 items-center">
        {/* Converge: orange waveform + navy light beam meet at the image edge (desktop only) */}
        {stream && !reduced && stream.length > 0 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <motion.div
              className="absolute h-3 origin-left"
              style={{
                left: stream.x,
                top: stream.y - 6,
                width: stream.length,
                background: "linear-gradient(90deg, rgba(14,59,140,0) 0%, rgba(14,59,140,0.28) 55%, rgba(14,59,140,0.5) 100%)",
                clipPath: "polygon(0 46%, 100% 0, 100% 100%, 0 54%)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={active ? { scaleX: [0, 1, 1], opacity: [0, 1, 0] } : { scaleX: 0, opacity: 0 }}
              transition={{ duration: M.convergeDuration + M.takeShapeDuration + 0.4, delay: M.convergeAt, times: [0, 0.45, 1], ease: EASE_OUT }}
            />
            <svg className="absolute overflow-visible" style={{ left: stream.x, top: stream.y - 12, width: stream.length, height: 24 }} viewBox={`0 0 ${stream.length} 24`} fill="none">
              <motion.path
                d={Array.from({ length: 9 }, (_, i) => {
                  const x = (stream.length / 8) * i;
                  const amp = [0, 5, 9, 6, 10, 7, 9, 4, 0][i];
                  return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${12 + (i % 2 ? -amp : amp)}`;
                }).join(" ")}
                stroke="#FF5A1F"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={active ? { pathLength: 1, opacity: [0, 1, 1, 0] } : { pathLength: 0, opacity: 0 }}
                transition={{
                  pathLength: { duration: M.convergeDuration, delay: M.convergeAt, ease: EASE_OUT },
                  opacity: { duration: M.convergeDuration + M.takeShapeDuration + 0.4, delay: M.convergeAt, times: [0, 0.1, 0.6, 1] },
                }}
              />
            </svg>
          </div>
        )}

        {/* Left Text */}
        <div ref={leftRef} className="relative z-10 lg:col-span-6 space-y-6">
          <motion.div className="inline-flex items-center gap-2" {...fadeUp(M.eyebrowAt, 8)}>
            <span className="h-[2px] w-4 bg-brand-orange" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
              Who We Are
            </span>
          </motion.div>

          <h2 ref={headlineRef} className="text-3xl sm:text-4xl font-bold text-ink font-heading leading-tight">
            {HEADLINE.map((w, i) => (
              <React.Fragment key={w.word}>
                <span data-word className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]">
                  <motion.span
                    className="relative inline-block"
                    initial={reduced ? false : { y: "105%" }}
                    animate={shown ? { y: "0%" } : { y: "105%" }}
                    transition={{ duration: M.headlineDuration, delay: reduced ? 0 : M.headlineAt + lineOf[i] * M.headlineLineStagger, ease: EASE_OUT }}
                  >
                    {w.underline ? (
                      <span className="relative inline-block">
                        {w.word}
                        <motion.span
                          aria-hidden="true"
                          className="absolute left-0 right-0 -bottom-[0.06em] h-[3px] rounded-full bg-gradient-to-r from-brand-navy to-brand-orange origin-left"
                          initial={reduced ? false : { scaleX: 0 }}
                          animate={shown ? { scaleX: 1 } : { scaleX: 0 }}
                          transition={{ duration: 0.6, delay: reduced ? 0 : M.underlineAt + lineOf[i] * M.headlineLineStagger, ease: EASE_OUT }}
                        />
                      </span>
                    ) : (
                      w.word
                    )}
                    {w.trailing}
                  </motion.span>
                </span>
                {i < HEADLINE.length - 1 ? " " : null}
              </React.Fragment>
            ))}
          </h2>

          <motion.p className="text-base sm:text-lg text-ink-muted leading-relaxed" {...fadeUp(M.paragraphAt)}>
            {COMPANY_INFO.aboutParagraphs[0]}
          </motion.p>

          <BrandMeaning active={active} reduced={reduced} />

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <FeatureCard
              title="Custom Engineering"
              text="Every installation is acoustically simulated and calibrated for its architectural geometry."
              titleClassName="text-brand-navy"
              delay={M.cardsAt}
              active={active}
              reduced={reduced}
            />
            <FeatureCard
              title="Future-Ready Tech"
              text="Leveraging AI voice-tracking, Dante IP audio networks, and 4K uncompressed routing."
              titleClassName="text-brand-orange"
              delay={M.cardsAt + M.cardsStagger}
              active={active}
              reduced={reduced}
            />
          </div>

          <motion.div className="pt-2" {...fadeUp(M.buttonAt, 10)}>
            <motion.div
              className="inline-block"
              style={{ x: magnetX, y: magnetY }}
              onPointerMove={onButtonMove}
              onPointerLeave={() => {
                magnetX.set(0);
                magnetY.set(0);
              }}
            >
              <Button
                to="/about"
                variant="primary"
                size="md"
                icon={<ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />}
              >
                Learn More About Our Team
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Right: the image takes shape */}
        <div className="relative z-10 lg:col-span-6">
          <TakeShapeImage ref={imageRef} active={active} reduced={reduced} isDesktop={isDesktop} />
        </div>
      </div>
    </section>
  );
};
