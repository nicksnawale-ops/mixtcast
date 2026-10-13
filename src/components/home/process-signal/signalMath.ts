/**
 * "From Silence to Signal": shared geometry and timing for the process signal line.
 * The line is a waveform whose amplitude and harmonics grow along its length — near-silence before stage 1,
 * a full, rich signal after stage 5.
 */

/** Stage nodes along the line (fraction of its length): evenly spaced. */
export const NODES = [0.1, 0.3, 0.5, 0.7, 0.9] as const;

/**
 * Desktop pinned story, as fractions of the pinned scroll range (0 = section pins, 1 = it unpins).
 * The line draws from DRAW_START to DRAW_END; after that the "System Live" end state holds until unpin.
 */
export const DRAW_START = 0.04;
export const DRAW_END = 0.84;
/** Drawn fraction at which the system is "live". */
export const LIVE_AT = 0.985;
/** Height of the pinned wrapper — the larger it is, the more scrolling each stage takes. */
export const PIN_HEIGHT_VH = 220;
/** Fixed site header height (px): the stage pins just below it. */
export const HEADER_HEIGHT = 80;

/** Scroll progress at which the signal reaches node `k` (0-based). */
export const progressAtNode = (k: number) => DRAW_START + NODES[k] * (DRAW_END - DRAW_START);

/** Active stage (1–5) for a drawn fraction: stage 1 until node 2 is reached, and so on. */
export const stageFor = (drawn: number) => Math.max(1, NODES.filter((n) => drawn >= n).length);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

// [gate (node the harmonic fades in at, or -1 = always), amplitude, cycles across the line, phase]
const HARMONICS: [number, number, number, number][] = [
  [-1, 0.05, 26, 0], // the faint ripple of an empty room
  [NODES[0], 0.24, 26, 0], // 1 · the carrier wakes up
  [NODES[1], 0.15, 53, 1.1], // 2 · first harmonic
  [NODES[2], 0.15, 9, 0.4], // 3 · low-frequency body
  [NODES[3], 0.12, 79, 2.3], // 4 · upper detail
  [NODES[4], 0.17, 37, 0.7], // 5 · full, live signal
];

/** Waveform value at `t` (0–1 along the line), roughly within −1…1. */
export const wave = (t: number) =>
  HARMONICS.reduce((y, [gate, amp, cycles, phase]) => {
    const g = gate < 0 ? 1 : smoothstep(gate - 0.06, gate + 0.06, t);
    return y + g * amp * Math.sin(2 * Math.PI * cycles * t + phase);
  }, 0);

/** Horizontal path: `length` px long, centred on `mid`, ±`amp` px. */
export const horizontalPath = (length: number, mid: number, amp: number) => {
  const n = Math.max(240, Math.round(length / 2));
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    d += `${i ? "L" : "M"}${(t * length).toFixed(1)} ${(mid - wave(t) * amp).toFixed(2)} `;
  }
  return d.trim();
};

/** Vertical path: `length` px tall, centred on `mid`, ±`amp` px. */
export const verticalPath = (length: number, mid: number, amp: number) => {
  const n = Math.max(240, Math.round(length / 3));
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    d += `${i ? "L" : "M"}${(mid + wave(t) * amp).toFixed(2)} ${(t * length).toFixed(1)} `;
  }
  return d.trim();
};
