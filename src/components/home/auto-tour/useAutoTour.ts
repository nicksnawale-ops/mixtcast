import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Home "Auto Tour": scrolls through every `[data-tour-section]` in page order, dwelling on each in proportion to
 * its text, then ends at the footer. A section marked `data-tour-section="pinned"` (the Methodology story) is
 * scrolled through slowly instead — `data-tour-stages` × STAGE_MS — so every stage is shown.
 *
 * Scrolling is driven frame by frame with window.scrollTo (Lenis follows native scroll position). All timing
 * runs on requestAnimationFrame with each frame's step capped, so the tour simply pauses while the tab is
 * hidden (no frames) and resumes where it was.
 */

const HEADER_OFFSET = 80; // fixed header height
const SCROLL_MS = 1600;
const MIN_DWELL_MS = 4000;
const MAX_DWELL_MS = 12000;
const MS_PER_WORD = 250;
const STAGE_MS = 4000; // per stage of the pinned Methodology story
const MAX_FRAME_MS = 50;

class Cancelled extends Error {}

interface Run {
  cancelled: boolean;
  raf: number;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
const clampScroll = (y: number) => Math.max(0, Math.min(y, maxScroll()));
const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
const setScroll = (y: number) => window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });

const dwellFor = (el: HTMLElement) => {
  const words = el.innerText.split(/\s+/).filter(Boolean).length;
  return Math.min(MAX_DWELL_MS, Math.max(MIN_DWELL_MS, words * MS_PER_WORD));
};

/** Calls onFrame(t) with t going 0 → 1 over `ms` of visible time. */
const frames = (run: Run, ms: number, onFrame: (t: number) => void) =>
  new Promise<void>((resolve, reject) => {
    let elapsed = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (run.cancelled) return reject(new Cancelled());
      elapsed += Math.min(now - last, MAX_FRAME_MS);
      last = now;
      const t = ms <= 0 ? 1 : Math.min(1, elapsed / ms);
      onFrame(t);
      if (t >= 1) resolve();
      else run.raf = requestAnimationFrame(tick);
    };
    run.raf = requestAnimationFrame(tick);
  });

const scrollTo = (run: Run, target: number, ms = SCROLL_MS, ease = easeInOut) => {
  const from = window.scrollY;
  const to = clampScroll(target);
  return frames(run, Math.abs(to - from) < 2 ? 0 : ms, (t) => setScroll(from + (to - from) * ease(t)));
};

const wait = (run: Run, ms: number) => frames(run, ms, () => {});

async function tour(run: Run) {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-tour-section]"));
  for (const [i, el] of sections.entries()) {
    const pinned = el.dataset.tourSection === "pinned" && el.offsetHeight > window.innerHeight * 1.5;
    if (pinned) {
      // Through the whole pinned range at an even pace, then on to the next section.
      const start = docTop(el) - HEADER_OFFSET;
      const end = docTop(el) + el.offsetHeight - window.innerHeight;
      await scrollTo(run, start);
      const stages = Number(el.dataset.tourStages) || 6;
      await scrollTo(run, end, stages * STAGE_MS, (t) => t);
      continue;
    }
    // The first section is the (sticky) hero: its stop is the very top of the page.
    await scrollTo(run, i === 0 ? 0 : docTop(el) - HEADER_OFFSET);
    await wait(run, dwellFor(el));
  }
  const footer = document.querySelector("footer");
  await scrollTo(run, footer ? docTop(footer) - HEADER_OFFSET : maxScroll());
}

export function useAutoTour(buttonRef: React.RefObject<HTMLElement | null>) {
  const [running, setRunning] = useState(false);
  const runRef = useRef<Run | null>(null);

  const stop = useCallback(() => {
    const run = runRef.current;
    if (!run) return;
    run.cancelled = true;
    cancelAnimationFrame(run.raf);
    runRef.current = null;
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    stop();
    const run: Run = { cancelled: false, raf: 0 };
    runRef.current = run;
    setRunning(true);
    tour(run)
      .catch((e) => {
        if (!(e instanceof Cancelled)) throw e;
      })
      .finally(() => {
        if (runRef.current === run) {
          runRef.current = null;
          setRunning(false);
        }
      });
  }, [stop]);

  // Any user input outside the button ends the tour (wheel, touch, keys, mouse down / drag / click).
  useEffect(() => {
    if (!running) return;
    const outside = (e: Event) => !(buttonRef.current && e.target instanceof Node && buttonRef.current.contains(e.target));
    const onInput = (e: Event) => {
      if (outside(e)) stop();
    };
    const opts = { capture: true, passive: true } as const;
    window.addEventListener("wheel", onInput, opts);
    window.addEventListener("touchstart", onInput, opts);
    window.addEventListener("pointerdown", onInput, opts);
    window.addEventListener("keydown", onInput, opts);
    return () => {
      window.removeEventListener("wheel", onInput, opts);
      window.removeEventListener("touchstart", onInput, opts);
      window.removeEventListener("pointerdown", onInput, opts);
      window.removeEventListener("keydown", onInput, opts);
    };
  }, [running, stop, buttonRef]);

  useEffect(() => stop, [stop]); // unmount: cancel the frame loop

  return { running, start, stop };
}
