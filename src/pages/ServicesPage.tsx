import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Volume2,
  Tv,
  Building2,
  Sun,
  MonitorPlay,
  Cpu,
  Waves,
  Sparkles,
  Film,
  Home,
  Video,
  Mic,
  Monitor,
  Cable,
  Music,
  Siren,
} from "lucide-react";
import { getVisibleServices } from "../data/services";
import { Button } from "../components/ui/Button";
// "Mixing Console" design: the Home console card styles are reused read-only; the rest is Services-specific.
import { CONSOLE_CSS } from "../components/home/services-console/consoleStyles";
import { SERVICES_CSS, SVC } from "../components/services/servicesConsoleStyles";
import { ServiceChannelCard } from "../components/services/ServiceChannelCard";
import { ServicesSignalField, type SignalFieldHandle } from "../components/services/ServicesSignalField";
import { FaderBank } from "../components/services/FaderBank";

const iconMap: Record<string, React.ReactNode> = {
  Volume2: <Volume2 className="w-6 h-6" />,
  Tv: <Tv className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
  Sun: <Sun className="w-6 h-6" />,
  MonitorPlay: <MonitorPlay className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
  Waves: <Waves className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Film: <Film className="w-6 h-6" />,
  Home: <Home className="w-6 h-6" />,
  Video: <Video className="w-6 h-6" />,
  Mic: <Mic className="w-6 h-6" />,
  Monitor: <Monitor className="w-6 h-6" />,
  Cable: <Cable className="w-6 h-6" />,
  Music: <Music className="w-6 h-6" />,
  Siren: <Siren className="w-6 h-6" />,
};

// Only visible services are listed; channel numbers (01, 02, …) are their fixed positions in this list.
const VISIBLE_SERVICES = getVisibleServices();

type CategoryFilter = "All" | (typeof VISIBLE_SERVICES)[number]["category"];

// Filter chips, in this order; a category is shown only while it has visible services.
const CATEGORY_ORDER: CategoryFilter[] = ["Audio", "Spaces", "Studios", "Video", "IT Infrastructure", "Safety & Security"];
const CATEGORIES: CategoryFilter[] = ["All", ...CATEGORY_ORDER.filter((c) => VISIBLE_SERVICES.some((s) => s.category === c))];

const EASE = [0.22, 1, 0.36, 1] as const;
const HEADLINE = "Comprehensive Audio-Visual Capabilities";

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

export const ServicesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("All");

  const categories = CATEGORIES;

  const filteredServices =
    activeFilter === "All"
      ? VISIBLE_SERVICES
      : VISIBLE_SERVICES.filter((s) => s.category === activeFilter);

  const reduced = !!useReducedMotion();
  const canHover = useMedia("(hover: hover) and (pointer: fine)");
  const wide = useMedia("(min-width: 768px)");
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<SignalFieldHandle>(null);

  // Loops (meters, pulses, waveform) run only while the card section is near the viewport and the tab is visible.
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

  // Entrance cascade ("console powering on"): cards entering together are queued in order, 70ms apart.
  const nextSlot = useRef(0);
  const claimDelay = useCallback(() => {
    const now = performance.now();
    const start = Math.max(now, nextSlot.current);
    nextSlot.current = start + SVC.cards.stagger * 1000;
    return (start - now) / 1000;
  }, []);
  const onActivate = useCallback((el: HTMLElement) => fieldRef.current?.route(el), []);

  return (
    <div className="space-y-16 pb-24">
      {/* Header */}
      <style>{CONSOLE_CSS + SERVICES_CSS}</style>
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
        {/* A faint fader bank moving like an automated mix (decorative) */}
        <FaderBank count={wide ? SVC.faders.desktop : SVC.faders.mobile} reduced={reduced} />
        <div className="relative inline-flex items-center gap-2 mb-3">
          <span className="h-[2px] w-4 bg-brand-orange" />
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Engineering Catalog
          </span>
          <span className="h-[2px] w-4 bg-brand-orange" />
        </div>
        {/* Headline: masked slide-up, word by word (wraps into lines naturally), with one soft light sweep */}
        <div className="relative overflow-hidden pb-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink font-heading tracking-tight">
            {HEADLINE.split(" ").map((word, i) => (
              <React.Fragment key={word}>
                {i > 0 && " "}
                <span className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
                  <motion.span
                    className="inline-block"
                    initial={reduced ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: SVC.hero.wordDuration, delay: 0.1 + i * SVC.hero.wordStagger, ease: EASE }}
                  >
                    {word}
                  </motion.span>
                </span>
              </React.Fragment>
            ))}
          </h1>
          <span
            aria-hidden="true"
            className="svc-sweep pointer-events-none absolute inset-y-0 left-0 w-1/5"
            style={{ background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.75), rgba(255,255,255,0))" }}
          />
        </div>
        <motion.p
          className="relative mt-4 text-base sm:text-lg text-ink-muted max-w-2xl mx-auto"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: SVC.hero.subAt, ease: EASE }}
        >
          Explore our complete range of AV, IT and safety solutions — from audio engineering and auditorium design to
          background music, fire alarm systems and IT hardware.
        </motion.p>

        {/* Filter Controls (Segmented Bar) */}
        {/* Filter controls as illuminated console buttons */}
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const on = activeFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={on}
                onClick={() => setActiveFilter(cat)}
                className={`inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-lg border text-xs font-bold transition-colors duration-200 cursor-pointer select-none whitespace-nowrap outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${
                  on
                    ? "bg-brand-navy border-brand-navy text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_16px_-6px_rgba(14,59,140,0.5)]"
                    : "bg-white border-line text-ink-muted hover:text-ink shadow-[inset_0_-2px_0_rgba(14,59,140,0.06),inset_0_1px_2px_rgba(14,59,140,0.06)]"
                }`}
              >
                <span aria-hidden="true" className="relative w-2 h-2 shrink-0">
                  <span className="svc-led-halo absolute -inset-1.5 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(255,90,31,0.65), rgba(255,90,31,0))" }} />
                  <span key={on ? "on" : "off"} className={`svc-led-flash relative block w-2 h-2 rounded-full ${on ? "bg-brand-orange" : "bg-[#E6E8EC]"}`} />
                </span>
                {cat} {cat === "All" ? `(${VISIBLE_SERVICES.length})` : ""}
              </button>
            );
          })}
        </div>
      </section>

      {/* The full console: one channel per visible service */}
      <section ref={sectionRef} data-paused={running ? undefined : ""} className="svc-cards relative">
        <ServicesSignalField ref={fieldRef} sectionRef={sectionRef} gridRef={gridRef} running={running} reduced={reduced} wide={wide} canHover={canHover} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredServices.map((service) => (
                <motion.div
                  key={service.slug}
                  layout={!reduced}
                  exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: reduced ? 0 : SVC.filter.layoutMs / 1000, ease: EASE }}
                >
                  <ServiceChannelCard
                    service={service}
                    channel={VISIBLE_SERVICES.indexOf(service) + 1}
                    icon={iconMap[service.icon] || <Volume2 className="w-6 h-6" />}
                    canHover={canHover}
                    reduced={reduced}
                    claimDelay={claimDelay}
                    onActivate={onActivate}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="p-10 rounded-3xl bg-surface-warm border border-line flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-ink font-heading">
              Need Multi-Disciplinary AV Integration?
            </h3>
            <p className="text-xs text-ink-muted">
              We package audio, video, lighting, and automation into coordinated turnkey contracts.
            </p>
          </div>
          <Button to="/contact" variant="primary" size="md">
            Request Proposal
          </Button>
        </div>
      </section>
    </div>
  );
};
