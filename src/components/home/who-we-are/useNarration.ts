import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useMotionValue } from "motion/react";
import { audioManager } from "../../../lib/audioManager";
import { getSoundPreference, hasUserActivation, setSoundPreference } from "../../../lib/sound";
import {
  NARRATION_AUDIO_SRC,
  NARRATION_CUES,
  NARRATION_SEGMENTS,
  type NarrationTarget,
} from "../../../data/whoWeAreNarration";

/** localStorage key: "on" once the visitor has listened (auto-read on later visits), "off" after they pause. */
export const NARRATION_PREF_KEY = "mixtcast_narration";

const VOLUME = 0.9;
const FADE_MS = 300;
const MANAGER_ID = "narration:who-we-are";

export type NarrationStatus = "idle" | "loading" | "playing" | "paused";

const getPref = () => {
  try {
    return localStorage.getItem(NARRATION_PREF_KEY);
  } catch {
    return null;
  }
};
const setPref = (value: "on" | "off") => {
  try {
    localStorage.setItem(NARRATION_PREF_KEY, value);
  } catch {
    // Storage unavailable.
  }
};

const pickVoice = () => {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const byLang = (lang: string) => voices.find((v) => v.lang.replace("_", "-").toLowerCase() === lang.toLowerCase());
  return byLang("en-IN") ?? byLang("en-GB") ?? byLang("en-US") ?? voices.find((v) => v.lang.toLowerCase().startsWith("en")) ?? null;
};

interface NarrationVisibility {
  /** At least half the section is visible (auto-start / resume). */
  mostlyInView: boolean;
  /** Any part of the section is visible (pause when it leaves). */
  inView: boolean;
}

/**
 * Who We Are narration: a recorded MP3 with cue-based sentence highlighting, falling back to the browser's speech
 * engine (sentence highlighting via utterance events) when the file is missing or can't play.
 */
export function useNarration(rootRef: RefObject<HTMLElement | null>, { mostlyInView, inView }: NarrationVisibility) {
  const [status, setStatus] = useState<NarrationStatus>("idle");
  const [pulse, setPulse] = useState(false);
  const progress = useMotionValue(0);

  const statusRef = useRef(status);
  statusRef.current = status;
  const modeRef = useRef<"file" | "speech" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentRef = useRef(0); // speech: segment to (re)start from
  const fadeRaf = useRef(0);
  const tickRaf = useRef(0);
  const autoPaused = useRef(false);
  const autoTried = useRef(false);

  const highlight = useCallback(
    (target: NarrationTarget | null) => {
      rootRef.current?.querySelectorAll<HTMLElement>("[data-narration-target]").forEach((el) => {
        el.dataset.narrationActive = String(el.dataset.narrationTarget === target);
      });
    },
    [rootRef]
  );

  // ---- Recorded file -------------------------------------------------------------------------------------------
  const fadeTo = (to: number, done?: () => void) => {
    const a = audioRef.current;
    cancelAnimationFrame(fadeRaf.current);
    if (!a) return done?.();
    const from = a.volume;
    const start = performance.now();
    const step = (now: number) => {
      // rAF timestamps can be slightly earlier than `start`, so clamp to [0, 1].
      const t = Math.max(0, Math.min(1, (now - start) / FADE_MS));
      a.volume = Math.max(0, Math.min(1, from + (to - from) * t));
      if (t < 1) fadeRaf.current = requestAnimationFrame(step);
      else done?.();
    };
    fadeRaf.current = requestAnimationFrame(step);
  };

  const tick = useCallback(() => {
    const a = audioRef.current;
    if (!a || statusRef.current !== "playing" || modeRef.current !== "file") return;
    if (a.duration) progress.set(a.currentTime / a.duration);
    const cue = [...NARRATION_CUES].reverse().find((c) => a.currentTime >= c.start);
    highlight(cue?.targetId ?? null);
    tickRaf.current = requestAnimationFrame(tick);
  }, [highlight, progress]);

  const finish = useCallback(() => {
    cancelAnimationFrame(tickRaf.current);
    segmentRef.current = 0;
    if (audioRef.current) audioRef.current.currentTime = 0;
    progress.set(0);
    highlight(null);
    audioManager.release(MANAGER_ID);
    setStatus("idle");
  }, [highlight, progress]);

  const playFile = async (): Promise<"ok" | "blocked" | "failed"> => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      a.src = NARRATION_AUDIO_SRC;
      a.addEventListener("ended", () => finish());
      audioRef.current = a;
    }
    const a = audioRef.current;
    a.volume = 0;
    try {
      await a.play();
    } catch (err) {
      return (err as DOMException)?.name === "NotAllowedError" ? "blocked" : "failed";
    }
    fadeTo(VOLUME);
    return "ok";
  };

  // ---- Speech fallback -----------------------------------------------------------------------------------------
  const speakFrom = useCallback(
    (index: number) => {
      const synth = window.speechSynthesis;
      if (!synth) return;
      if (index >= NARRATION_SEGMENTS.length) return finish();
      const segment = NARRATION_SEGMENTS[index];
      const utterance = new SpeechSynthesisUtterance(segment.text);
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? "en-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = VOLUME;
      const n = NARRATION_SEGMENTS.length;
      utterance.onstart = () => {
        highlight(segment.targetId);
        progress.set(index / n);
      };
      utterance.onboundary = (e) => progress.set((index + Math.min(1, e.charIndex / segment.text.length)) / n);
      utterance.onend = () => {
        if (statusRef.current === "playing" && segmentRef.current === index) {
          segmentRef.current = index + 1;
          speakFrom(index + 1);
        }
      };
      utterance.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") return; // our own pause/stop
        if (e.error === "not-allowed") setPulse(true); // needs a click first
        audioManager.release(MANAGER_ID);
        highlight(null);
        setStatus(segmentRef.current > 0 ? "paused" : "idle");
      };
      segmentRef.current = index;
      synth.speak(utterance);
    },
    [finish, highlight, progress]
  );

  // ---- Controls ------------------------------------------------------------------------------------------------
  const pauseInternal = useCallback(
    (fadeMs = FADE_MS) => {
      if (statusRef.current !== "playing" && statusRef.current !== "loading") return;
      cancelAnimationFrame(tickRaf.current);
      audioManager.release(MANAGER_ID);
      highlight(null);
      setStatus("paused");
      if (modeRef.current === "speech") window.speechSynthesis?.cancel();
      else if (audioRef.current) {
        const a = audioRef.current;
        if (fadeMs > 0) fadeTo(0, () => a.pause());
        else a.pause();
      }
    },
    [highlight]
  );

  const play = useCallback(
    async (manual: boolean) => {
      if (statusRef.current === "playing" || statusRef.current === "loading") return;
      if (manual) {
        setPref("on");
        if (getSoundPreference() === "off") setSoundPreference("on");
      }
      setPulse(false);
      autoPaused.current = false;
      setStatus("loading");
      // Only one site audio at a time: this fades out e.g. the Solutions curtain music.
      audioManager.claim(MANAGER_ID, () => pauseInternal(FADE_MS));

      if (modeRef.current !== "speech") {
        const result = await playFile();
        if (result === "ok") {
          modeRef.current = "file";
          setStatus("playing");
          statusRef.current = "playing";
          tickRaf.current = requestAnimationFrame(tick);
          return;
        }
        if (result === "blocked") {
          audioManager.release(MANAGER_ID);
          setStatus(progress.get() > 0 ? "paused" : "idle");
          setPulse(true);
          return;
        }
        modeRef.current = "speech"; // file missing or unplayable → browser voice
      }
      if (!window.speechSynthesis) {
        audioManager.release(MANAGER_ID);
        setStatus("idle");
        return;
      }
      setStatus("playing");
      statusRef.current = "playing";
      speakFrom(segmentRef.current);
    },
    [pauseInternal, progress, speakFrom, tick]
  );

  /** Button click / Space / Enter. */
  const toggle = useCallback(() => {
    if (statusRef.current === "playing" || statusRef.current === "loading") {
      setPref("off");
      autoPaused.current = false;
      pauseInternal();
    } else {
      play(true);
    }
  }, [pauseInternal, play]);

  // Auto-read on later visits (once listened), when ≥50% of the section is in view.
  useEffect(() => {
    if (!mostlyInView || getPref() !== "on" || getSoundPreference() === "off") return;
    if (autoPaused.current && statusRef.current === "paused") {
      play(false);
      return;
    }
    if (statusRef.current !== "idle" || autoTried.current) return;
    autoTried.current = true;
    if (!hasUserActivation()) setPulse(true); // the browser would block it — invite a tap instead
    else play(false);
  }, [mostlyInView, play]);

  // Pause when the section scrolls out of view.
  useEffect(() => {
    if (!inView && statusRef.current === "playing") {
      autoPaused.current = true;
      pauseInternal();
    }
  }, [inView, pauseInternal]);

  // Pause when the tab is hidden; resume when it comes back (if it was playing and is still in view).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && statusRef.current === "playing") {
        autoPaused.current = true;
        pauseInternal(0);
      } else if (!document.hidden && autoPaused.current && mostlyInView && getPref() === "on") {
        play(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [mostlyInView, pauseInternal, play]);

  // Stop on unmount (navigating away).
  useEffect(
    () => () => {
      cancelAnimationFrame(tickRaf.current);
      cancelAnimationFrame(fadeRaf.current);
      audioRef.current?.pause();
      if (modeRef.current === "speech") window.speechSynthesis?.cancel();
      audioManager.release(MANAGER_ID);
    },
    []
  );

  return { status, pulse, progress, toggle };
}
