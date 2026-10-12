import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, animate, stagger } from "motion/react";
import { LogoMark } from "../brand/Logo";

interface CurtainRevealProps {
  children: React.ReactNode;
}

/** sessionStorage key: the curtain plays once per browser session. */
export const CURTAIN_PLAYED_KEY = "mixtcast_solutions_curtain_played";

// Timeline (ms from mount)
const CUE_AT = 400; // logo fades out, seam brightens
const OPEN_AT = 800; // panels start parting
const REVEAL_AT = 1200; // hero entrance starts as panels clear the center
const OPEN_DURATION = 1.2; // s → fully open at ~2000ms
const SKIP_OPEN_DURATION = 0.6; // s, when the visitor clicks / presses Escape
const OPEN_EASE = [0.76, 0, 0.24, 1] as const;

type Phase = "closed" | "cue" | "opening" | "done";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hasPlayed = () => {
  try {
    return sessionStorage.getItem(CURTAIN_PLAYED_KEY) === "1";
  } catch {
    return false;
  }
};

const markPlayed = () => {
  try {
    sessionStorage.setItem(CURTAIN_PLAYED_KEY, "1");
  } catch {
    // Storage unavailable (private mode etc.) — curtain simply replays.
  }
};

// Velvet: pleated folds + top-to-bottom shading + diagonal sheen.
const velvetBackground = [
  "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.07) 45%, transparent 60%)",
  "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35) 100%)",
  "repeating-linear-gradient(90deg, #0A2A63 0px, #0E3B8C 18px, #0A2A63 36px, #071E48 48px, #0A2A63 60px)",
].join(", ");

export const CurtainReveal: React.FC<CurtainRevealProps> = ({ children }) => {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [shouldPlay] = useState(() => !reducedMotion && !hasPlayed());
  const [phase, setPhase] = useState<Phase>(shouldPlay ? "closed" : "done");
  const [openDuration, setOpenDuration] = useState(OPEN_DURATION);

  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const revealed = useRef(false);

  // The hero's own elements (eyebrow, headline, paragraph) are the card's direct children.
  const getHeroItems = () => {
    const card = contentRef.current?.firstElementChild as HTMLElement | null;
    if (!card) return [];
    return card.children.length ? (Array.from(card.children) as HTMLElement[]) : [card];
  };

  const revealHero = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    animate(
      getHeroItems(),
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: stagger(0.12) }
    );
  }, []);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  // Hide hero items before first paint so the entrance never flashes.
  useLayoutEffect(() => {
    if (reducedMotion) {
      const wrapper = contentRef.current;
      if (!wrapper) return;
      wrapper.style.opacity = "0";
      animate(wrapper, { opacity: [0, 1] }, { duration: 0.5, ease: "easeOut" });
      return;
    }
    getHeroItems().forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
    });
    if (!shouldPlay) {
      revealHero();
    }
  }, [reducedMotion, shouldPlay, revealHero]);

  // Automatic timeline.
  useEffect(() => {
    if (!shouldPlay) return;
    markPlayed();

    const bars = logoRef.current?.querySelectorAll<SVGGElement>(".waveform-left, .waveform-right");
    if (bars?.length) {
      animate(bars, { scaleY: [1, 0.5, 1.15, 0.85, 1] }, { duration: 0.65, delay: 0.1, ease: "easeInOut" });
    }

    timers.current.push(
      window.setTimeout(() => setPhase("cue"), CUE_AT),
      window.setTimeout(() => setPhase("opening"), OPEN_AT),
      window.setTimeout(revealHero, REVEAL_AT),
      window.setTimeout(() => setPhase("done"), OPEN_AT + OPEN_DURATION * 1000)
    );
    return clearTimers;
  }, [shouldPlay, revealHero]);

  const skip = useCallback(() => {
    if (phase !== "closed" && phase !== "cue") return;
    clearTimers();
    setOpenDuration(SKIP_OPEN_DURATION);
    setPhase("opening");
    revealHero();
    timers.current.push(window.setTimeout(() => setPhase("done"), SKIP_OPEN_DURATION * 1000));
  }, [phase, revealHero]);

  useEffect(() => {
    if (phase === "done") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, skip]);

  const isOpening = phase === "opening";
  const panelTransition = { duration: openDuration, ease: OPEN_EASE };

  return (
    <div className="relative overflow-hidden w-full rounded-3xl">
      {/* Underlying Content — always in the DOM */}
      <div ref={contentRef} className="w-full">
        {children}
      </div>

      {/* Curtain overlay */}
      {phase !== "done" && (
        <div
          aria-hidden="true"
          onClick={skip}
          className="absolute inset-0 z-30 cursor-pointer select-none"
        >
          {/* Warm light spill from behind the curtain */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 55% 70% at 50% 50%, rgba(255,240,228,0.95) 0%, rgba(255,90,31,0.4) 40%, rgba(255,90,31,0) 75%)",
            }}
            initial={{ opacity: 0 }}
            animate={isOpening ? { opacity: [0, 0.45, 0] } : { opacity: 0 }}
            transition={{ duration: openDuration, times: [0, 0.35, 1], ease: "easeInOut" }}
          />

          {/* Left Curtain */}
          <motion.div
            className="absolute inset-y-0 left-0 w-[calc(50%+1px)]"
            style={{
              background: velvetBackground,
              boxShadow: "inset -14px 0 24px -12px rgba(0,0,0,0.55)",
              transformOrigin: "left center",
              willChange: "transform",
            }}
            initial={false}
            animate={isOpening ? { x: "-100%", scaleX: 0.85 } : { x: "0%", scaleX: 1 }}
            transition={panelTransition}
          />

          {/* Right Curtain */}
          <motion.div
            className="absolute inset-y-0 right-0 w-[calc(50%+1px)]"
            style={{
              background: velvetBackground,
              boxShadow: "inset 14px 0 24px -12px rgba(0,0,0,0.55)",
              transformOrigin: "right center",
              willChange: "transform",
            }}
            initial={false}
            animate={isOpening ? { x: "100%", scaleX: 0.85 } : { x: "0%", scaleX: 1 }}
            transition={panelTransition}
          />

          {/* Orange light seam where the panels meet */}
          <motion.div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,90,31,0) 0%, rgba(255,90,31,0.35) 50%, rgba(255,90,31,0) 100%)",
            }}
            initial={{ opacity: 0.4, scaleX: 1 }}
            animate={
              isOpening
                ? { opacity: 0, scaleX: 2.5 }
                : phase === "cue"
                  ? { opacity: 1, scaleX: 2.5 }
                  : { opacity: 0.4, scaleX: 1 }
            }
            transition={{ duration: isOpening ? 0.3 : 0.4, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,90,31,0) 0%, #FF5A1F 20%, #FF7A00 50%, #FF5A1F 80%, rgba(255,90,31,0) 100%)",
            }}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: isOpening ? 0 : phase === "cue" ? 1 : 0.6 }}
            transition={{ duration: isOpening ? 0.3 : 0.4, ease: "easeOut" }}
          />

          {/* Brand mark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              ref={logoRef}
              className="[&_g]:[transform-box:fill-box] [&_g]:[transform-origin:center]"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={phase === "closed" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <LogoMark className="w-28 h-14 sm:w-40 sm:h-20" />
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};
