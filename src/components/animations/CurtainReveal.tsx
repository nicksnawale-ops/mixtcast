import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, animate, stagger, type AnimationPlaybackControls } from "motion/react";
import { AudioLines } from "lucide-react";
import { LogoMark } from "../brand/Logo";
import {
  getSoundPreference,
  hasUserActivation,
  play,
  preload,
  setSoundPreference,
  unlockAudio,
  type SoundHandle,
} from "../../lib/sound";

interface CurtainRevealProps {
  children: React.ReactNode;
  /** Skip the curtain for this visit and show the content in its final state (e.g. deep links). */
  skip?: boolean;
  /** Called once when the hero content starts to reveal (immediately when the curtain is skipped). */
  onReveal?: () => void;
}

// One-time cleanup: the curtain used to play once per session behind this flag.
try {
  sessionStorage.removeItem("mixtcast_solutions_curtain_played");
} catch {
  // Storage unavailable — nothing to clean up.
}

/** All curtain timings in one place (ms from mount unless noted). Tune here. */
export const CURTAIN_TIMING = {
  cueAt: 600, // logo fades out, seam brightens
  openAt: 1100, // panels start parting
  openDuration: 2200, // panels fully open at openAt + openDuration (~3300ms)
  openEase: [0.65, 0, 0.35, 1] as [number, number, number, number],
  revealAt: 1900, // hero text starts as the panels clear the center
  heroItemDuration: 900,
  heroStagger: 150,
  beamsAt: 1500, // spotlight beams sweep in
  beamsDuration: 2800,
  skipOpenDuration: 600, // when the visitor clicks / presses Escape
  sound: {
    at: 1100, // starts with the panels parting
    offset: 0, // s into the excerpt
    duration: 14, // s — the whole excerpt, never looped
    fadeIn: 1.2, // s
    fadeOut: 2.5, // s
    volume: 0.3,
    stopFadeMs: 400, // when the visitor skips, scrolls past the hero or leaves
  },
};

type Phase = "closed" | "cue" | "opening" | "done";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Velvet: pleated folds + top-to-bottom shading + diagonal sheen.
const velvetBackground = [
  "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.07) 45%, transparent 60%)",
  "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35) 100%)",
  "repeating-linear-gradient(90deg, #0A2A63 0px, #0E3B8C 18px, #0A2A63 36px, #071E48 48px, #0A2A63 60px)",
].join(", ");

// Heavier fold at each panel's inner (leading) edge.
const innerFold = (side: "left" | "right") =>
  `linear-gradient(${side === "left" ? "90deg" : "270deg"}, rgba(0,0,0,0) 0%, rgba(7,30,72,0.55) 55%, rgba(255,255,255,0.08) 80%, rgba(7,30,72,0.7) 100%)`;

const T = CURTAIN_TIMING;

export const CurtainReveal: React.FC<CurtainRevealProps> = ({ children, skip: skipCurtain = false, onReveal }) => {
  const [reducedMotion] = useState(prefersReducedMotion);
  // Plays on every mount (every visit to the Solutions page).
  const [shouldPlay] = useState(() => !reducedMotion && !skipCurtain);
  const [phase, setPhase] = useState<Phase>(shouldPlay ? "closed" : "done");
  const [skipped, setSkipped] = useState(false);
  const [beams, setBeams] = useState(false);
  // Final beam angles (deg), aimed at the showcase screen wherever the layout puts it.
  const [beamAim, setBeamAim] = useState({ left: -22, right: 22 });

  // Sound: preference "off" never plays; without a prior interaction the browser blocks audio,
  // so we show a small "Sound" pill instead of trying.
  const [soundPref, setSoundPref] = useState(getSoundPreference);
  const [soundBlocked, setSoundBlocked] = useState(() => shouldPlay && soundPref !== "off" && !hasUserActivation());
  const [soundPlaying, setSoundPlaying] = useState(false);
  // Once shown, the pill stays for the rest of the curtain so the visitor can see/undo their choice.
  const [pillVisible, setPillVisible] = useState(false);
  useEffect(() => {
    if (soundBlocked || soundPref === "off") setPillVisible(true);
  }, [soundBlocked, soundPref]);
  const soundRef = useRef<SoundHandle | null>(null);
  const startedAt = useRef(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const animations = useRef<AnimationPlaybackControls[]>([]);
  const revealed = useRef(false);
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  // The hero's own elements (eyebrow, headline, paragraph, showcase) are the card's direct children.
  const getHeroItems = () => {
    const card = contentRef.current?.firstElementChild as HTMLElement | null;
    if (!card) return [];
    return card.children.length ? (Array.from(card.children) as HTMLElement[]) : [card];
  };

  const revealHero = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    onRevealRef.current?.();
    const controls = animate(
      getHeroItems(),
      { opacity: [0, 1], y: [20, 0] },
      { duration: T.heroItemDuration / 1000, ease: [0.22, 1, 0.36, 1], delay: stagger(T.heroStagger / 1000) }
    );
    animations.current.push(controls);
  }, []);

  /** Point each spotlight from its top anchor towards the centre of the showcase screen. */
  const aimBeams = () => {
    const root = rootRef.current;
    const screen = contentRef.current?.querySelector('[aria-roledescription="carousel"]');
    if (!root || !screen) return;
    const r = root.getBoundingClientRect();
    const s = screen.getBoundingClientRect();
    const target = { x: s.left + s.width / 2 - r.left, y: s.top + s.height / 2 - r.top };
    const top = -0.1 * r.height; // beams hang from 10% above the card
    const angle = (originX: number) => (Math.atan2(target.x - originX, target.y - top) * -180) / Math.PI;
    const clamp = (v: number) => Math.max(-62, Math.min(62, v));
    setBeamAim({ left: clamp(angle(r.width * 0.19)), right: clamp(angle(r.width * 0.81)) });
  };

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const stopSound = (fadeMs = T.sound.stopFadeMs) => {
    soundRef.current?.stop(fadeMs);
    soundRef.current = null;
    setSoundPlaying(false);
  };

  /** Start the curtain sound, joining mid-way if the curtain is already opening. */
  const startSound = useCallback(async () => {
    // Unlock + decode first, then work out where the curtain is, so the sound stays in sync.
    if (!(await unlockAudio()) || !(await preload("curtain-classical"))) {
      setSoundBlocked(true);
      return;
    }
    const elapsed = (performance.now() - startedAt.current - T.sound.at) / 1000;
    if (elapsed > T.sound.duration - 0.4) return; // too late to be worth it
    const late = Math.max(0, elapsed);
    const handle = await play("curtain-classical", {
      offset: T.sound.offset + late,
      duration: T.sound.duration - late,
      fadeIn: T.sound.fadeIn,
      fadeOut: T.sound.fadeOut,
      volume: T.sound.volume,
      normalize: true,
    });
    if (!handle) {
      setSoundBlocked(true);
      return;
    }
    soundRef.current = handle;
    setSoundPlaying(true);
    timers.current.push(window.setTimeout(() => setSoundPlaying(false), (T.sound.duration - late) * 1000));
  }, []);

  // Hide hero items before first paint so the entrance never flashes.
  useLayoutEffect(() => {
    if (skipCurtain) {
      onRevealRef.current?.();
      return;
    }
    if (reducedMotion) {
      onRevealRef.current?.();
      const wrapper = contentRef.current;
      if (!wrapper) return;
      wrapper.style.opacity = "0";
      const controls = animate(wrapper, { opacity: [0, 1] }, { duration: 0.5, ease: "easeOut" });
      return () => controls.stop();
    }
    getHeroItems().forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
    });
    if (!shouldPlay) {
      revealHero();
    }
  }, [skipCurtain, reducedMotion, shouldPlay, revealHero]);

  // Automatic timeline.
  useEffect(() => {
    if (!shouldPlay) return;
    startedAt.current = performance.now();
    if (getSoundPreference() !== "off") preload("curtain-classical");

    const bars = logoRef.current?.querySelectorAll<SVGGElement>(".waveform-left, .waveform-right");
    if (bars?.length) {
      animations.current.push(
        animate(bars, { scaleY: [1, 0.5, 1.15, 0.85, 1] }, { duration: 0.65, delay: 0.15, ease: "easeInOut" })
      );
    }

    timers.current.push(
      window.setTimeout(() => setPhase("cue"), T.cueAt),
      window.setTimeout(() => setPhase("opening"), T.openAt),
      window.setTimeout(() => {
        aimBeams();
        setBeams(true);
      }, T.beamsAt),
      window.setTimeout(() => setBeams(false), T.beamsAt + T.beamsDuration),
      window.setTimeout(revealHero, T.revealAt),
      window.setTimeout(() => setPhase("done"), T.openAt + T.openDuration),
      window.setTimeout(() => {
        if (getSoundPreference() !== "off" && hasUserActivation()) startSound();
      }, T.sound.at)
    );
    return clearTimers;
  }, [shouldPlay, revealHero, startSound]);

  // Stop animations and sound if the page is left mid-sequence.
  useEffect(
    () => () => {
      animations.current.forEach((a) => a.stop());
      animations.current = [];
      soundRef.current?.stop(T.sound.stopFadeMs);
      soundRef.current = null;
    },
    []
  );

  // Fade the music out once the visitor scrolls down past the hero.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!soundPlaying || !rootRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) stopSound();
      },
      { rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [soundPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  const skip = useCallback(() => {
    if (phase === "done" || skipped) return;
    clearTimers();
    stopSound();
    setSkipped(true);
    setBeams(false);
    setPhase("opening");
    revealHero();
    timers.current.push(window.setTimeout(() => setPhase("done"), T.skipOpenDuration));
  }, [phase, skipped, revealHero]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === "done") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, skip]);

  const toggleSound = async () => {
    if (soundPlaying || (soundPref !== "off" && !soundBlocked)) {
      setSoundPreference("off");
      setSoundPref("off");
      stopSound();
      return;
    }
    setSoundPreference("on");
    setSoundPref("on");
    // This click is a user gesture, so audio can be unlocked now.
    if (!(await unlockAudio())) {
      setSoundBlocked(true);
      return;
    }
    setSoundBlocked(false);
    if (performance.now() - startedAt.current >= T.sound.at && !skipped) startSound();
  };

  const isOpening = phase === "opening";
  const openSeconds = (skipped ? T.skipOpenDuration : T.openDuration) / 1000;
  const panelTransition = { duration: openSeconds, ease: skipped ? ([0.76, 0, 0.24, 1] as const) : T.openEase };
  // A skip mid-opening re-targets the panels (tiny offset) so they finish quickly from where they are.
  const leftOpen = { x: skipped ? "-100.5%" : "-100%", scaleX: 0.85 };
  const rightOpen = { x: skipped ? "100.5%" : "100%", scaleX: 0.85 };
  const soundAudible = soundPref !== "off" && !soundBlocked;
  const showSoundPill = shouldPlay && phase !== "done" && !skipped && pillVisible;

  return (
    <div ref={rootRef} className="relative overflow-hidden w-full rounded-3xl">
      {/* Underlying Content — always in the DOM */}
      <div ref={contentRef} className="w-full">
        {children}
      </div>

      {/* Stage spotlights: two soft beams converge on the screen, then fade */}
      {beams && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
          {(["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              className={`absolute -top-[10%] h-[130%] w-[34%] ${side === "left" ? "left-[2%]" : "right-[2%]"}`}
              style={{
                transformOrigin: "top center",
                background:
                  "linear-gradient(180deg, rgba(255,186,120,0.38) 0%, rgba(255,214,170,0.18) 45%, rgba(255,214,170,0) 85%)",
                clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
              }}
              initial={{ opacity: 0, rotate: beamAim[side] + (side === "left" ? -26 : 26) }}
              animate={{ opacity: [0, 0.9, 0.55, 0], rotate: beamAim[side] }}
              transition={{
                opacity: { duration: T.beamsDuration / 1000, times: [0, 0.3, 0.7, 1], ease: "easeInOut" },
                rotate: { duration: (T.beamsDuration / 1000) * 0.6, ease: [0.22, 1, 0.36, 1] },
              }}
            />
          ))}
        </div>
      )}

      {/* Curtain overlay */}
      {phase !== "done" && (
        <div aria-hidden="true" onClick={skip} className="absolute inset-0 z-30 cursor-pointer select-none">
          {/* Warm light spill from behind the curtain: grows as the panels open, then settles */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 55% 70% at 50% 50%, rgba(255,240,228,0.95) 0%, rgba(255,90,31,0.4) 40%, rgba(255,90,31,0) 75%)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={isOpening ? { opacity: [0, 0.5, 0.3, 0], scale: [0.6, 1.1, 1, 1] } : { opacity: 0, scale: 0.6 }}
            transition={{ duration: openSeconds, times: [0, 0.45, 0.8, 1], ease: "easeInOut" }}
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
            animate={isOpening ? leftOpen : { x: "0%", scaleX: 1 }}
            transition={panelTransition}
          >
            {/* Heavy inner fold edge that sways slightly as the fabric moves */}
            <motion.div
              className="absolute inset-y-0 right-0 w-12"
              style={{ background: innerFold("left"), transformOrigin: "top right" }}
              animate={isOpening && !skipped ? { y: [0, -4, 3, -1, 0], skewY: [0, -1.2, 0.8, -0.3, 0] } : { y: 0, skewY: 0 }}
              transition={{ duration: openSeconds, ease: "easeInOut" }}
            />
          </motion.div>

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
            animate={isOpening ? rightOpen : { x: "0%", scaleX: 1 }}
            transition={panelTransition}
          >
            <motion.div
              className="absolute inset-y-0 left-0 w-12"
              style={{ background: innerFold("right"), transformOrigin: "top left" }}
              animate={isOpening && !skipped ? { y: [0, -3, 4, -1, 0], skewY: [0, 1.2, -0.8, 0.3, 0] } : { y: 0, skewY: 0 }}
              transition={{ duration: openSeconds, ease: "easeInOut" }}
            />
          </motion.div>

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
            transition={{ duration: isOpening ? 0.4 : 0.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,90,31,0) 0%, #FF5A1F 20%, #FF7A00 50%, #FF5A1F 80%, rgba(255,90,31,0) 100%)",
            }}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: isOpening ? 0 : phase === "cue" ? 1 : 0.6 }}
            transition={{ duration: isOpening ? 0.4 : 0.5, ease: "easeOut" }}
          />

          {/* Brand mark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              ref={logoRef}
              className="[&_g]:[transform-box:fill-box] [&_g]:[transform-origin:center]"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={phase === "closed" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <LogoMark className="w-28 h-14 sm:w-40 sm:h-20" />
            </motion.div>
          </div>
        </div>
      )}

      {/* Sound toggle — only while the curtain plays and audio is off/blocked */}
      {showSoundPill && (
        <motion.button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundAudible}
          aria-label={soundAudible ? "Sound on. Turn site sound off" : "Sound off. Turn site sound on"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          // Bottom-left of the *visible* part of the card (the card can be taller than the screen).
          style={{ top: "min(calc(100svh - 112px - 60px), calc(100% - 60px))" }}
          className="absolute left-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-lg text-xs font-semibold text-brand-navy hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] transition-colors"
        >
          <AudioLines className={`w-4 h-4 ${soundAudible ? "text-brand-orange" : "text-brand-navy/60"}`} aria-hidden="true" />
          <span>{soundAudible ? "Sound on" : "Sound off"}</span>
        </motion.button>
      )}
    </div>
  );
};
