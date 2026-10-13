import { audioManager } from "./audioManager";

// Tiny Web Audio sound utility. Uses a GainNode for volume/fades (iOS ignores HTMLAudioElement.volume)
// and never throws: blocked playback simply resolves to null.

/** localStorage key for the site-wide sound preference: "on" | "off" (unset = on once the visitor has interacted). */
export const SOUND_PREF_KEY = "mixtcast_sound";
export const DEFAULT_VOLUME = 0.35;

/** Sources in order of preference; the first one the browser can decode is used. */
export const SOUNDS = {
  "curtain-classical": ["/audio/curtain-classical.webm", "/audio/curtain-classical.mp3"],
} as const;

export type SoundName = keyof typeof SOUNDS;
export type SoundPreference = "on" | "off";

export interface PlayOptions {
  /** Start position inside the file, in seconds. */
  offset?: number;
  /** How long to play, in seconds (defaults to the rest of the file). */
  duration?: number;
  volume?: number;
  /** Fade-in / fade-out lengths, in seconds. */
  fadeIn?: number;
  fadeOut?: number;
  /** Raise quiet recordings so their peak sits near full scale before `volume` is applied. */
  normalize?: boolean;
}

export interface SoundHandle {
  stop(fadeMs?: number): void;
}

let context: AudioContext | null = null;
let playCount = 0;
const buffers = new Map<SoundName, Promise<AudioBuffer | null>>();
const peaks = new WeakMap<AudioBuffer, number>();
const active = new Set<SoundHandle>();

const peakOf = (buffer: AudioBuffer) => {
  let peak = peaks.get(buffer);
  if (peak === undefined) {
    peak = 0;
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < data.length; i += 4) peak = Math.max(peak, Math.abs(data[i]));
    }
    peaks.set(buffer, peak);
  }
  return peak;
};

/** Fade out everything that is currently playing (e.g. when the visitor pauses or leaves). */
export function fadeOutAll(fadeMs = 600) {
  active.forEach((handle) => handle.stop(fadeMs));
}

export function getSoundPreference(): SoundPreference | null {
  try {
    const value = localStorage.getItem(SOUND_PREF_KEY);
    return value === "on" || value === "off" ? value : null;
  } catch {
    return null;
  }
}

export function setSoundPreference(value: SoundPreference) {
  try {
    localStorage.setItem(SOUND_PREF_KEY, value);
  } catch {
    // Storage unavailable — preference lasts for this page only.
  }
}

/** True when the browser will let audio start without a fresh click (the visitor has interacted with the page). */
export function hasUserActivation(): boolean {
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return activation ? activation.hasBeenActive : true;
}

function getContext(): AudioContext | null {
  if (context) return context;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
  } catch {
    return null;
  }
  return context;
}

/** Fetch and decode a sound ahead of time. Safe to call repeatedly. */
export function preload(name: SoundName): Promise<AudioBuffer | null> {
  let pending = buffers.get(name);
  if (!pending) {
    pending = (async () => {
      const ctx = getContext();
      if (!ctx) return null;
      for (const src of SOUNDS[name]) {
        try {
          const response = await fetch(src);
          if (!response.ok) continue;
          return await ctx.decodeAudioData(await response.arrayBuffer());
        } catch {
          // Format not supported here — try the next source.
        }
      }
      return null;
    })();
    buffers.set(name, pending);
  }
  return pending;
}

/** Resume the audio context. Call from a click/tap handler to unlock audio on strict browsers.
 * A blocked context never resumes, so we give up after a short wait. */
export async function unlockAudio(timeoutMs = 1000): Promise<boolean> {
  const ctx = getContext();
  if (!ctx) return false;
  if (ctx.state !== "running") {
    try {
      await Promise.race([ctx.resume(), new Promise((resolve) => setTimeout(resolve, timeoutMs))]);
    } catch {
      // Blocked by autoplay policy.
    }
  }
  return ctx.state === "running";
}

/** Play a sound with fades. Resolves to null if sound is off, unsupported or blocked by the browser. */
export async function play(name: SoundName, options: PlayOptions = {}): Promise<SoundHandle | null> {
  if (getSoundPreference() === "off") return null;
  try {
    if (!(await unlockAudio())) return null;
    const buffer = await preload(name);
    const ctx = getContext();
    if (!buffer || !ctx) return null;

    const { offset = 0, fadeIn = 0.3, fadeOut = 0.6, normalize = false } = options;
    const makeup = normalize ? Math.min(6, 0.9 / Math.max(peakOf(buffer), 0.01)) : 1;
    const volume = (options.volume ?? DEFAULT_VOLUME) * makeup;
    const length = Math.min(options.duration ?? buffer.duration - offset, buffer.duration - offset);
    if (length <= 0.05) return null;

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    source.connect(gain).connect(ctx.destination);

    const start = ctx.currentTime;
    const end = start + length;
    const fadeInEnd = start + Math.min(fadeIn, length / 2);
    const fadeOutStart = Math.max(fadeInEnd, end - fadeOut);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, fadeInEnd);
    gain.gain.setValueAtTime(volume, fadeOutStart);
    gain.gain.linearRampToValueAtTime(0, end);
    source.start(start, offset, length);

    let stopped = false;
    const managerId = `sound:${name}:${++playCount}`;
    const handle: SoundHandle = {
      stop(fadeMs = 150) {
        if (stopped) return;
        stopped = true;
        active.delete(handle);
        audioManager.release(managerId);
        try {
          const now = ctx.currentTime;
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
          source.stop(now + fadeMs / 1000 + 0.02);
        } catch {
          // Already finished.
        }
      },
    };
    active.add(handle);
    // Only one site audio at a time: starting this fades out e.g. the Home narration (and vice versa).
    audioManager.claim(managerId, (ms) => handle.stop(ms));
    source.onended = () => {
      active.delete(handle);
      audioManager.release(managerId);
    };
    return handle;
  } catch {
    return null;
  }
}
