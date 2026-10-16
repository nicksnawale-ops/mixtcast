import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { SOLUTIONS } from "../../../data/solutions";
import { SpacePortalCard } from "./SpacePortalCard";
import { PORTAL_CSS } from "./portalStyles";

/**
 * Home "Environments — Spaces We Transform": "Room Portals" — each space is a full-bleed photo framed like a
 * proscenium arch, with a floor plan of the room drawn on hover. Entered through a light "Proscenium" transition:
 * an arch line draws around the header, a soft spotlight rises behind it, and the header fades up.
 *
 * The <section> stays a direct `max-w-7xl` child of the page (the "Site Survey Scan" transition below reads its
 * padded box), so the full-width seam is sized to the viewport by measurement instead of a wrapper.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const STAGGER = 0.09; // s between cards
const SEAM = 120; // soft #FAF8F5 → white seam from the Services section
const SPACES = SOLUTIONS.slice(0, 6);

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

/** Arch around the header: two halves drawn from the bottom ends up to the top centre. */
const archHalves = (w: number, h: number, ry: number) => {
  const cx = w / 2;
  return [`M0 ${h} V${ry} A${cx} ${ry} 0 0 1 ${cx} 0`, `M${w} ${h} V${ry} A${cx} ${ry} 0 0 0 ${cx} 0`];
};

export const SpacesPortalSection: React.FC = () => {
  const reduced = !!useReducedMotion();
  const canHover = useMedia("(hover: hover) and (pointer: fine)");
  const wide = useMedia("(min-width: 768px)");
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerOn = useInView(headerRef, { once: true, amount: 0.3 }) || reduced;

  // Header box (for the arch) and the seam's full-viewport extent + the page gap above.
  const [box, setBox] = useState({ w: 0, h: 0, left: 0 });
  const [seam, setSeam] = useState({ left: 0, width: 0, gap: 0 });
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    if (!section || !header) return;
    const measure = () => {
      setBox({ w: header.offsetWidth, h: header.offsetHeight, left: header.offsetLeft });
      const prev = section.previousElementSibling as HTMLElement | null;
      setSeam({
        left: -section.getBoundingClientRect().left,
        width: document.documentElement.clientWidth,
        gap: prev ? Math.max(0, section.offsetTop - (prev.offsetTop + prev.offsetHeight)) : 0,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(header);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Idle photo drift runs only while the section is near the viewport and the tab is visible.
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

  // Entrance cascade: cards entering together are queued in order, 90ms apart.
  const nextSlot = useRef(0);
  const claimDelay = useCallback(() => {
    const now = performance.now();
    const start = Math.max(now, nextSlot.current);
    nextSlot.current = start + STAGGER * 1000;
    return (start - now) / 1000;
  }, []);

  // The arch sits just outside the header, but never beyond the section's side padding (no horizontal overflow).
  const pad = Math.max(0, Math.min(wide ? 32 : 6, box.left - 4));
  const ry = wide ? 64 : 36;
  const above = ry + 24; // the arch's apex sits this far above the header (in the page gap — adds no height)
  const archW = box.w + pad * 2;
  const archH = box.h + above + 12;
  const seamH = Math.min(SEAM, seam.gap) + 1;

  const fadeUp = (delay: number) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 16 },
          animate: headerOn ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <section ref={sectionRef} data-paused={running ? undefined : ""} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <style>{PORTAL_CSS}</style>

      {/* Soft seam from the Services section's warm off-white into white (overlay only; covers its 1px bottom border) */}
      {seam.gap > 0 && seam.width > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ left: seam.left, width: seam.width, top: -seam.gap - 1, height: seamH, background: "linear-gradient(to bottom, #FAF8F5, rgba(250,248,245,0))" }}
        />
      )}

      <div ref={headerRef} className="relative text-center max-w-3xl mx-auto mb-16" data-proscenium={headerOn ? "on" : undefined}>
        {/* Proscenium: a soft spotlight and an arch line framing the header */}
        <div
          aria-hidden="true"
          className="sp-spot pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[190%]"
          style={{ background: "radial-gradient(closest-side, rgba(255,186,140,0.1), rgba(255,236,224,0.04) 55%, rgba(255,255,255,0))" }}
        />
        {box.w > 0 && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute overflow-visible"
            style={{ left: -pad, top: -above }}
            width={archW}
            height={archH}
            viewBox={`0 0 ${archW} ${archH}`}
            fill="none"
          >
            {archHalves(archW, archH, ry).map((d) => (
              <path key={d} className="sp-arch-line" d={d} pathLength={1} stroke="rgba(14,59,140,0.25)" strokeWidth={1} />
            ))}
          </svg>
        )}

        <motion.span className="relative text-xs font-bold uppercase tracking-widest text-brand-orange block mb-2" {...fadeUp(0.5)}>
          Environments
        </motion.span>
        <motion.h2 className="relative text-3xl sm:text-4xl font-bold text-ink font-heading" {...fadeUp(0.6)}>
          Spaces We Transform
        </motion.h2>
        <motion.p className="relative mt-3 text-base text-ink-muted" {...fadeUp(0.7)}>
          Engineered architectural audio and visual integrations tailored for specific room dynamics.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SPACES.map((space, index) => (
          <SpacePortalCard key={space.id} space={space} index={index} canHover={canHover} reduced={reduced} claimDelay={claimDelay} />
        ))}
      </div>
    </section>
  );
};
