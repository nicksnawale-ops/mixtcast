import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePatchIn } from "../patch-in/patchInContext";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { getVisibleServices } from "../../../data/services";
import { Button } from "../../ui/Button";
import { ChannelCard } from "./ChannelCard";
import { SignalMatrix, type SignalMatrixHandle } from "./SignalMatrix";
import { CONSOLE_CSS } from "./consoleStyles";

const STAGGER = 0.07; // s between cards in the entrance cascade

// Home shows only the featured services. To change the set or its order, edit `featured: true` and
// `featuredOrder` in src/data/services.ts — the Services page lists every visible service. Hidden services never show.
const VISIBLE_SERVICES = getVisibleServices();
const FEATURED_SERVICES = VISIBLE_SERVICES.filter((s) => s.featured).sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));

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

/** True while the element is near the viewport and the tab is visible. */
const useRunning = (ref: React.RefObject<HTMLElement | null>) => {
  const [onScreen, setOnScreen] = useState(false);
  const [visible, setVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { rootMargin: "100px 0px" });
    observer.observe(el);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return onScreen && visible;
};

/**
 * Home "Specialized Audio-Visual Services": "The Mixing Console" — each service card is a console channel strip,
 * over a subtle signal-routing matrix.
 */
export const ServicesConsoleSection: React.FC<{ iconFor: (name: string) => React.ReactNode }> = ({ iconFor }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const matrixRef = useRef<SignalMatrixHandle>(null);
  const reduced = !!useReducedMotion();
  const canHover = useMedia("(hover: hover) and (pointer: fine)");
  const wide = useMedia("(min-width: 768px)");
  const running = useRunning(sectionRef);

  // Entrance cascade: cards that come into view together are queued left → right, row by row.
  const nextSlot = useRef(0);
  const claimDelay = useCallback(() => {
    const now = performance.now();
    const start = Math.max(now, nextSlot.current);
    nextSlot.current = start + STAGGER * 1000;
    return (start - now) / 1000;
  }, []);

  const onActivate = useCallback((el: HTMLElement) => matrixRef.current?.route(el), []);

  // Patch In (when wrapped by PatchInTransition): the grid rests dimmed and the cascade waits until the cable
  // connects; the transition then triggers the one-time power-on from its port.
  const patch = usePatchIn();
  const unpowered = !!patch && !patch.powered;
  useEffect(() => {
    if (!patch) return;
    patch.registerPowerOn((x, y) => matrixRef.current?.powerOn(x, y));
    return () => patch.registerPowerOn(null);
  }, [patch?.registerPowerOn]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section ref={sectionRef} data-paused={running ? undefined : ""} className="relative overflow-hidden bg-surface-warm py-20 border-y border-line">
      <style>{CONSOLE_CSS}</style>
      <SignalMatrix
        ref={matrixRef}
        sectionRef={sectionRef}
        gridRef={gridRef}
        running={running}
        reduced={reduced}
        wide={wide}
        canHover={canHover}
        dimmed={unpowered}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span data-patch-eyebrow className="text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2">
              End-to-End Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-ink font-heading">
              Specialized Audio-Visual Services
            </h2>
          </div>
          <Button to="/services" variant="secondary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
            View All {VISIBLE_SERVICES.length} Services
          </Button>
        </div>

        {/* Channel strips */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_SERVICES.map((service, index) => (
            <ChannelCard
              key={service.slug}
              service={service}
              index={index}
              icon={iconFor(service.icon)}
              canHover={canHover}
              reduced={reduced}
              claimDelay={claimDelay}
              onActivate={onActivate}
              held={unpowered}
            />
          ))}
        </div>

        {/* The full list, one click away */}
        <div className="mt-10 flex justify-center">
          <Button to="/services" variant="secondary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
            View All {VISIBLE_SERVICES.length} Services
          </Button>
        </div>
      </div>
    </section>
  );
};
