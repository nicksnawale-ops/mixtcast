import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { SOLUTIONS, SolutionSpace } from "../data/solutions";
import { isServiceVisible } from "../data/services";
import { CURTAIN_TIMING, CurtainReveal } from "../components/animations/CurtainReveal";
import { SHOWCASE_TIMING, SpacesShowcase } from "../components/solutions/SpacesShowcase";
import { AcousticBlueprint } from "../components/solutions/acoustic-blueprint/AcousticBlueprint";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";
import { Button } from "../components/ui/Button";

/**
 * Space photo panel: same frame as the ImageWithFallback cinema panel (4:3, navy top/bottom
 * border), with a caption overlay. Falls back to the original placeholder if the photo fails.
 */
const SolutionPhoto: React.FC<{ sol: SolutionSpace; eager: boolean }> = ({ sol, eager }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduceMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <ImageWithFallback
        alt={sol.title}
        fallbackTitle={sol.title}
        category="Space Integration"
        aspectRatioClass="aspect-4/3"
        cinemaFrame={true}
      />
    );
  }

  const show = inView && loaded;

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden bg-surface-warm select-none aspect-4/3 border-y-[3px] border-brand-navy"
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
        <motion.img
          src={sol.photo}
          srcSet={`${sol.photo.replace(".webp", "-800.webp")} 800w, ${sol.photo} 1600w`}
          sizes="(min-width: 1024px) 480px, calc(100vw - 6rem)"
          alt={sol.photoAlt}
          width={1600}
          height={1200}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.05 }}
          animate={show ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: reduceMotion ? 0.3 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Caption: same label and space name as the placeholder */}
      <div className="absolute inset-x-0 bottom-0 px-5 pt-12 pb-4 bg-gradient-to-t from-brand-navy/85 via-brand-navy/40 to-transparent pointer-events-none">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-brand-orange-soft mb-0.5">
          Space Integration
        </span>
        <h4 className="text-sm font-semibold text-white font-heading line-clamp-1">
          {sol.title}
        </h4>
      </div>
    </div>
  );
};

const HIGHLIGHT_MS = 1200;

/** The curtain music fades to silence as the showcase finishes its first full cycle (ms from mount). */
const MUSIC_ENDS_AT = CURTAIN_TIMING.revealAt + SOLUTIONS.length * SHOWCASE_TIMING.slideMs;

/** Space slug from a deep link like /solutions#auditoriums, or null if it matches no space. */
const getDeepLinkSlug = (hash: string) => {
  const slug = decodeURIComponent(hash.replace(/^#/, ""));
  return SOLUTIONS.some((s) => s.slug === slug) ? slug : null;
};

export const SolutionsPage: React.FC = () => {
  const { hash } = useLocation();
  // Read once on mount: a valid deep link skips the curtain and scrolls to that space.
  const [targetSlug] = useState(() => getDeepLinkSlug(hash));
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null);
  const [showcaseActive, setShowcaseActive] = useState(false);
  const highlightTimers = useRef<number[]>([]);

  /** Briefly ring a space's card so the visitor sees where they landed. */
  const flashHighlight = useCallback((slug: string, delayMs: number) => {
    highlightTimers.current.forEach((t) => window.clearTimeout(t));
    highlightTimers.current = [
      window.setTimeout(() => setHighlightSlug(slug), delayMs),
      window.setTimeout(() => setHighlightSlug(null), delayMs + HIGHLIGHT_MS + 200),
    ];
  }, []);
  useEffect(() => () => highlightTimers.current.forEach((t) => window.clearTimeout(t)), []);

  /** "Explore this space" in the showcase: same section scroll + highlight as deep links. */
  const exploreSpace = useCallback(
    (slug: string) => {
      const el = document.getElementById(slug);
      if (!el) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      flashHighlight(slug, reduceMotion ? 100 : 700);
    },
    [flashHighlight]
  );

  useEffect(() => {
    if (!targetSlug) return;
    const el = document.getElementById(targetSlug);
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
    const timers: number[] = [];
    let userScrolled = false;

    // Uses the section's scroll-margin-top, so the heading clears the fixed header.
    const scrollToTarget = () => el.scrollIntoView({ behavior, block: "start" });
    const realign = () => {
      if (userScrolled) return;
      const offset = el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop || "0");
      if (Math.abs(offset) > 4) scrollToTarget();
    };
    const onUserScroll = () => {
      userScrolled = true;
    };
    const onLoad = () => timers.push(window.setTimeout(realign, 150));

    // Deferred so it runs after the layout's scroll-to-top on route change.
    timers.push(window.setTimeout(scrollToTarget, 50));

    flashHighlight(targetSlug, reduceMotion ? 100 : 700);

    // Re-check once after images have loaded, in case layout shifted.
    if (document.readyState === "complete") {
      timers.push(window.setTimeout(realign, 1200));
    } else {
      window.addEventListener("load", onLoad);
    }
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchstart", onUserScroll, { passive: true });
    window.addEventListener("keydown", onUserScroll);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("load", onLoad);
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchstart", onUserScroll);
      window.removeEventListener("keydown", onUserScroll);
    };
  }, [targetSlug, flashHighlight]);

  return (
    // Ambient "Acoustic Blueprint" background (decoration only, behind all content)
    <AcousticBlueprint curtainOpen={showcaseActive}>
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* 1. CURTAIN REVEAL HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <CurtainReveal skip={targetSlug !== null} onReveal={() => setShowcaseActive(true)} soundEndsAt={MUSIC_ENDS_AT}>
          {/* Stacked + centred below lg; two columns from lg (text 43% left, showcase 57% right — the showcase stays
              within ~6% of its previous size).
              The text items stay direct children so the curtain can stagger them in. */}
          <div className="px-6 py-8 md:px-10 md:py-10 lg:px-12 lg:py-14 rounded-3xl bg-surface-warm border border-line text-center flex flex-col items-center gap-5 md:gap-6 lg:grid lg:grid-cols-[minmax(0,43fr)_minmax(0,57fr)] lg:grid-rows-[1fr_auto_auto_auto_1fr] lg:gap-x-14 lg:gap-y-5 lg:text-left">
            <div className="inline-flex items-center gap-2 lg:col-start-1 lg:row-start-2 lg:justify-self-start">
              <span className="h-[2px] w-4 bg-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                Engineered Solutions by Space
              </span>
              <span className="h-[2px] w-4 bg-brand-orange" />
            </div>

            <h1 className="text-[clamp(1.75rem,7.5vw,2.25rem)] md:text-[clamp(2rem,5vw,2.75rem)] lg:text-[clamp(2.25rem,2.9vw,3.25rem)] font-extrabold text-ink font-heading tracking-tight lg:tracking-[-0.02em] lg:[text-wrap:balance] max-w-4xl leading-[1.12] lg:leading-[1.1] lg:col-start-1 lg:row-start-3">
              Architectural AV Environments Calibrated for Peak Performance
            </h1>

            <p className="text-base sm:text-lg text-ink-muted max-w-2xl lg:max-w-[36rem] leading-relaxed lg:mt-1 lg:col-start-1 lg:row-start-4">
              Every room has unique physics. We resolve sound reflections, sightline constraints,
              and operational complexity with tailored hardware and automation architecture.
            </p>

            <SpacesShowcase
              spaces={SOLUTIONS}
              active={showcaseActive}
              onExplore={exploreSpace}
              className="mt-2 md:mt-4 lg:mt-0 lg:col-start-2 lg:row-start-1 lg:row-span-5 lg:self-center"
            />
          </div>
        </CurtainReveal>
      </section>

      {/* 2. DETAILED SOLUTIONS LIST BY SPACE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {SOLUTIONS.map((sol, index) => {
          const isReversed = index % 2 === 1;

          return (
            <div
              key={sol.id}
              id={sol.slug}
              className="relative scroll-mt-28 p-8 sm:p-12 rounded-3xl bg-surface border border-line shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Deep-link landing highlight (opacity only) */}
              {highlightSlug === sol.slug && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-brand-orange/70 shadow-[0_0_0_6px_rgba(255,90,31,0.12),0_0_32px_rgba(255,90,31,0.25)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ duration: HIGHLIGHT_MS / 1000, times: [0, 0.15, 0.6, 1], ease: "easeOut" }}
                />
              )}
              <div
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Text Content (7 cols) */}
                <div className={`space-y-6 ${isReversed ? "lg:col-span-7 lg:order-2" : "lg:col-span-7"}`}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
                      Space 0{index + 1} · {sol.slug.replace("-", " ")}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-ink font-heading leading-tight">
                      {sol.title}
                    </h2>
                    <p className="text-sm font-semibold text-brand-navy mt-1">
                      {sol.tagline}
                    </p>
                  </div>

                  {/* Challenge & Solution Blocks */}
                  <div className="space-y-4 pt-2">
                    {/* The Challenge */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>The Architectural Challenge</span>
                      </div>
                      <p className="text-xs text-amber-950/80 leading-relaxed">
                        {sol.challenge}
                      </p>
                    </div>

                    {/* Our Solution */}
                    <div className="p-4 rounded-2xl bg-brand-navy/5 border border-brand-navy/15 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-navy uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-brand-orange shrink-0" />
                        <span>The MixtCast Engineering Solution</span>
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        {sol.solution}
                      </p>
                    </div>
                  </div>

                  {/* Key Systems Used (Chips linking to services) */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-2">
                      Key Integrated Systems
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {/* Chips for hidden services are left out */}
                      {sol.keySystems.filter((sys) => isServiceVisible(sys.serviceSlug)).map((sys, idx) => (
                        <Link
                          key={idx}
                          to={`/services/${sys.serviceSlug}`}
                          className="px-3 py-1.5 rounded-lg bg-surface-warm border border-line text-xs font-semibold text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
                        >
                          {sys.label} →
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Measurable Outcomes */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider block">
                      Targeted Performance Outcomes
                    </span>
                    <ul className="space-y-1.5">
                      {sol.outcomes.map((out, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-ink/90 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4">
                    <Button to="/contact" variant="primary" size="sm">
                      Consult on this Space
                    </Button>
                  </div>
                </div>

                {/* Image (5 cols) */}
                <div className={`${isReversed ? "lg:col-span-5 lg:order-1" : "lg:col-span-5"}`}>
                  <div className="rounded-2xl overflow-hidden shadow-lg border border-line">
                    <SolutionPhoto sol={sol} eager={index === 0} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. CTA BAND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-surface-warm border border-line text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-ink font-heading">
            Have a Complex Venue or Multi-Room Requirement?
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted max-w-xl mx-auto">
            Our engineering team conducts detailed on-site sound and electrical audits to create tailored infrastructure proposals.
          </p>
          <div className="pt-2">
            <Button to="/contact" variant="cta" size="md">
              Schedule Site Audit in Pune
            </Button>
          </div>
        </div>
      </section>
    </div>
    </AcousticBlueprint>
  );
};
