import { COMPANY_INFO } from "../../../data/company";

/**
 * "From Silence to Signal": shared geometry and timing for the process signal line.
 * The line is a waveform whose amplitude and harmonics grow along its length — near-silence before the first stage,
 * a full, rich signal after the last. Everything is derived from the number of stages in the data.
 */

/** Number of process stages (from the data). */
export const STAGE_COUNT = COMPANY_INFO.process.length;

/** Stage nodes along the line (fraction of its length): evenly spaced — 0.1, 0.3 … 0.9 for 5 stages. */
export const NODES: readonly number[] = Array.from({ length: STAGE_COUNT }, (_, i) => (i + 0.5) / STAGE_COUNT);

/**
 * Desktop pinned story, as fractions of the pinned scroll range (0 = section pins, 1 = it unpins).
 * The line draws from DRAW_START to DRAW_END; after that the "System Live" end state holds until unpin.
 */
export const DRAW_START = 0.04;
export const DRAW_END = 0.84;
/** Drawn fraction at which the system is "live". */
export const LIVE_AT = 0.985;
/**
 * Height of the pinned wrapper (vh): one viewport plus PIN_VH_PER_STAGE per stage, so every stage keeps the same
 * scroll distance whatever the count (5 stages → 220vh, 6 → 244vh). Raise PIN_VH_PER_STAGE for slower stages.
 */
export const PIN_VH_PER_STAGE = 24;
export const PIN_HEIGHT_VH = 100 + PIN_VH_PER_STAGE * STAGE_COUNT;
/** Fixed site header height (px): the stage pins just below it. */
export const HEADER_HEIGHT = 80;

/** Scroll progress at which the signal reaches node `k` (0-based). */
export const progressAtNode = (k: number) => DRAW_START + NODES[k] * (DRAW_END - DRAW_START);

/** Active stage (1–STAGE_COUNT) for a drawn fraction: stage 1 until node 2 is reached, and so on. */
export const stageFor = (drawn: number) => Math.max(1, NODES.filter((n) => drawn >= n).length);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

// One harmonic fades in at each node: [amplitude weight, cycles across the line, phase].
const LAYERS: [number, number, number][] = [
  [0.24, 26, 0], // the carrier wakes up
  [0.15, 53, 1.1], // first harmonic
  [0.15, 9, 0.4], // low-frequency body
  [0.12, 79, 2.3], // upper detail
  [0.1, 17, 1.7], // mid texture
  [0.17, 37, 0.7], // full, live signal
];
// [gate (node the harmonic fades in at, or -1 = always), amplitude, cycles, phase]. The per-node amplitudes are
// normalised to the same total as before (0.83), so the finished signal is as rich whatever the stage count.
const layersUsed = Array.from({ length: STAGE_COUNT }, (_, i) => LAYERS[Math.min(i, LAYERS.length - 1)]);
const ampTotal = layersUsed.reduce((sum, [amp]) => sum + amp, 0);
const HARMONICS: [number, number, number, number][] = [
  [-1, 0.05, 26, 0], // the faint ripple of an empty room
  ...layersUsed.map(([amp, cycles, phase], i): [number, number, number, number] => [NODES[i], (amp / ampTotal) * 0.83, cycles, phase]),
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
